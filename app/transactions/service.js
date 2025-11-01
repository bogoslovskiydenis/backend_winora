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
const CheckAvailableOrderKeyHandler = require("@/handlers/CheckAvailableOrderKeyHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const GetPostByIdHandler = require("@/handlers/GetPostByIdHandler")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")
const PrepareDataHandler = require("@/handlers/PrepareDataHandler")
const UpdateByIdHandler = require("@/handlers/UpdateByIdHandler")
const GetUserTransactionByIdHandler = require("@/app/transactions/handlers/GetUserTransactionByIdHandler")
const GetUserTransactionsByTypes = require("@/app/transactions/handlers/GetUserTransactionsByTypesHandler")
const TotalUserTransactionsByTypes = require("@/app/transactions/handlers/TotalUserTransactionsByTypes")
const GetUserTransactionsHandler = require("@/app/transactions/handlers/GetUserTransactionsHandler")
const TotalUserTransactionsHandler = require("@/app/transactions/handlers/TotalUserTransactionsHandler")
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
    this.allowedOrderKey = [
      "id",
      "amount",
      "status",
      "type",
      "confirmed_at",
      "created_at"
    ]
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

  async getUserTransactionsByStatus({ userId, settings }) {
    const context = { errors: [], body: {}, settings, userId }
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

  async getUserTransactionsByTypes({ userId, settings }) {
    const context = { errors: [], body: {}, settings, userId }
    const chain = new CheckAvailableTypeTransactionsHandler(this.allowedTypes)
    chain
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetUserTransactionsByTypes())
      .setNext(new TotalUserTransactionsByTypes())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async getUserTransactionById({ userId, transactionId }) {
    const context = { errors: [], body: { transactionId }, userId }
    const chain = new GetUserTransactionByIdHandler()

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async getUserTransactions({ userId, settings }) {
    const context = { errors: [], body: {}, settings, userId }

    const chain = new CheckAvailableOrderKeyHandler(this.allowedOrderKey)
    chain
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetUserTransactionsHandler())
      .setNext(new TotalUserTransactionsHandler())

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
