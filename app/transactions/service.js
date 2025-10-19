const crypto = require("crypto")
const FrontUsersModel = require("@/models/FrontUsers")
const AdminUsers = require("@/models/AdminUsers")
const transactionsModel = require("@/models/Transactions")
const CheckCreateTransactionPermissionHandler = require("@/app/transactions/handlers/CheckCreateTransactionPermissionHandler")
const TrimTransactionFieldsHandler = require("@/app/transactions/handlers/TrimTransactionFieldsHandler")
const ValidateTransactionFieldsHandler = require("@/app/transactions/handlers/ValidateTransactionFieldsHandler")
const SetDepositTransactionDefaultsHandler = require("@/app/transactions/handlers/SetDepositTransactionDefaultsHandler")
const PrepareTransactionDataInsertHandler = require("@/app/transactions/handlers/PrepareTransactionDataInsertHandler")
const InsertDepositTransactionHandler = require("@/app/transactions/handlers/InsertDepositTransactionHandler")

class TransactionService {
  #frontUserModel
  #adminUserModel
  constructor() {
    this.#frontUserModel = new FrontUsersModel()
    this.#adminUserModel = new AdminUsers()
  }
  async indexStatus(settings) {
    const context = { errors: [], body: {} }
    const { errors, body } = {
      errors: [],
      body: {
        test: "Test value"
      }
    }
    return { errors, body, status: errors.length ? "error" : "ok" }
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
