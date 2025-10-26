const FrontUsersModel = require("@/models/FrontUsers")
const AdminUsers = require("@/models/AdminUsers")
const CheckCreateTransactionPermissionHandler = require("@/app/transactions/handlers/CheckCreateTransactionPermissionHandler")
const ValidateTransactionFieldsHandler = require("@/app/transactions/handlers/ValidateTransactionFieldsHandler")
const SetDepositTransactionDefaultsHandler = require("@/app/transactions/handlers/SetDepositTransactionDefaultsHandler")
const PrepareTransactionDataInsertHandler = require("@/app/transactions/handlers/PrepareTransactionDataInsertHandler")
const InsertDepositTransactionHandler = require("@/app/transactions/handlers/InsertDepositTransactionHandler")
const CheckAvailableStatusTransactionsHandler = require("@/app/transactions/handlers/CheckAvailableStatusTransactionsHandler")
const CheckPaginationParamsHandler = require("@/handlers/CheckNormalizePaginationParamsHandler")
const GetPostsByStatusHandler = require("@/app/transactions/handlers/GetPostsByStatusHandler")
const TotalByStatusHandler = require("@/app/transactions/handlers/TotalByStatusHandler")
const CheckAvailableTypeTransactionsHandler = require("@/app/transactions/handlers/CheckAvailableTypeTransactionsHandler")
const GetPostsByTypeHandler = require("@/app/transactions/handlers/GetPostsByTypeHandler")
const TotalByTypeHandler = require("@/app/transactions/handlers/TotalByTypeHandler")
const GetUserTransactionsByStatus = require("@/app/transactions/handlers/GetUserTransactionsByStatusHandler")
const TotalUserTransactionsByStatuses = require("@/app/transactions/handlers/TotalUserTransactionsByStatus")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const GetPostByIdHandler = require("@/handlers/GetPostByIdHandler")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")
const PrepareDataHandler = require("@/handlers/PrepareDataHandler")
const UpdateByIdHandler = require("@/handlers/UpdateByIdHandler")
const transactionsModel = require("@/models/Transactions")

class TransactionService {
  #frontUserModel
  #adminUserModel
  #allowedRoles
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
    this.#allowedRoles = ["super_admin", "fin_admin"]
    this.stringTypesField = [
      "currency",
      "network",
      "from_address",
      "to_address",
      "explorer_url",
      "internal_comment",
      "user_comment"
    ]
    this.model = transactionsModel
  }
  async indexStatus({ settings, editorId }) {
    const context = { errors: [], body: {}, settings, editorId }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new CheckAvailableStatusTransactionsHandler(this.alloweStatuses))
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetPostsByStatusHandler())
      .setNext(new TotalByStatusHandler())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async indexType({ settings, editorId }) {
    const context = { errors: [], body: {}, settings, editorId }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new CheckAvailableTypeTransactionsHandler(this.allowedTypes))
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetPostsByTypeHandler())
      .setNext(new TotalByTypeHandler())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async getUserTransactionsByStatus(settings) {
    const context = { errors: [], body: {}, settings }

    const chain = new CheckAvailableStatusTransactionsHandler(
      this.alloweStatuses
    )
    chain
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetUserTransactionsByStatus())
      .setNext(new TotalUserTransactionsByStatuses())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async store(data) {
    const context = { body: data, errors: [], insertId: null }

    const chain = new CheckCreateTransactionPermissionHandler()
    chain
      .setNext(new SetDepositTransactionDefaultsHandler())
      .setNext(new ValidateTransactionFieldsHandler())
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new PrepareTransactionDataInsertHandler())
      .setNext(new InsertDepositTransactionHandler())

    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }

  async getPostById({ id, editorId }) {
    const context = { editorId, errors: [], body: {}, data: { id } }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostByIdHandler(this.model))

    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }

  async update({ postData, editorId }) {
    const context = { editorId, errors: [], body: postData }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new PrepareDataHandler(["internal_comment", "id"]))
      .setNext(new UpdateByIdHandler(this.model))

    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }
}
module.exports = new TransactionService()
