const FrontUsersModel = require("@/models/FrontUsers")
const AdminUsers = require("@/models/AdminUsers")
const CheckCreateTransactionPermissionHandler = require("@/app/transactions/handlers/CheckCreateTransactionPermissionHandler")
const TrimTransactionFieldsHandler = require("@/app/transactions/handlers/TrimTransactionFieldsHandler")
const ValidateTransactionFieldsHandler = require("@/app/transactions/handlers/ValidateTransactionFieldsHandler")
const SetDepositTransactionDefaultsHandler = require("@/app/transactions/handlers/SetDepositTransactionDefaultsHandler")
const PrepareTransactionDataInsertHandler = require("@/app/transactions/handlers/PrepareTransactionDataInsertHandler")
const InsertDepositTransactionHandler = require("@/app/transactions/handlers/InsertDepositTransactionHandler")
const CheckAvailableStatusTransactionsHandler = require("@/app/transactions/handlers/CheckAvailableStatusTransactionsHandler")
const CheckPaginationParams = require("@/handlers/CheckNormalizePaginationParams")
const GetPublicPostsByStatusHandler = require("@/app/transactions/handlers/GetPublicPostsByStatusHandler")
const TotalByStatusHandler = require("@/app/transactions/handlers/TotalByStatusHandler")

class TransactionService {
  #frontUserModel
  #adminUserModel
  constructor() {
    this.#frontUserModel = new FrontUsersModel()
    this.#adminUserModel = new AdminUsers()
    this.alloweStatuses = [
      "pending",
      "processing",
      "confirmed",
      "failed",
      "canceled"
    ]
    this.allowedTypes = ["deposit", "withdrawal"]
  }
  async indexStatus(settings) {
    const context = { errors: [], body: {}, settings }

    const chain = new CheckAvailableStatusTransactionsHandler(
      this.alloweStatuses
    )
    chain
      .setNext(new CheckPaginationParams())
      .setNext(new GetPublicPostsByStatusHandler())
      .setNext(new TotalByStatusHandler())
    const { errors, body } = await chain.handle(context)

    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async store(data) {
    const context = {
      body: data,
      errors: [],
      insertId: null
    }

    const chain = new CheckCreateTransactionPermissionHandler()
    chain
      .setNext(new SetDepositTransactionDefaultsHandler())
      .setNext(new ValidateTransactionFieldsHandler())
      .setNext(new TrimTransactionFieldsHandler())
      .setNext(new PrepareTransactionDataInsertHandler())
      .setNext(new InsertDepositTransactionHandler())

    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }
}
module.exports = new TransactionService()
