const ValidatePostStructureHandler = require("@/app/investments/handlers/ValidatePostStructureHandler")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")
const NormalizePostHandler = require("@/app/investments/handlers/NormalizePostHandler")
const CheckUserBalanceHandler = require("@/handlers/CheckUserBalanceHandler")
const EmitBalanceUpdateHandler = require("@/handlers/EmitBalanceUpdateHandler")
const CreateInvestmentHandler = require("@/app/investments/handlers/CreateInvestmentHandler")
const ValidatePresetTypeHandler = require("@/handlers/ValidatePresetTypeHandler")
const CheckAvailableStatusHandler = require("@/handlers/CheckAvailableStatusHandler")
const CheckPaginationParamsHandler = require("@/handlers/CheckNormalizePaginationParamsHandler")
const GetUserInvestmentsByStatusHandler = require("@/app/investments/handlers/GetUserInvestmentsByStatusHandler")
const GetUserInvestmentByIdHandler = require("@/app/investments/handlers/GetUserInvestmentByIdHandler")
const TotalUserInvestmentsByStatuses = require("@/app/investments/handlers/TotalUserInvestmentsByStatuses")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const GetPostsByStatusHandler = require("@/app/investments/handlers/GetPostsByStatusHandler")
const TotalByStatusHandler = require("@/app/investments/handlers/TotalByStatusHandler")
const GetPostByIdHandler = require("@/handlers/GetPostByIdHandler")
const PrepareDataHandler = require("@/handlers/PrepareDataHandler")
const UpdateByIdHandler = require("@/handlers/UpdateByIdHandler")
const LogInvestmentChangesHandler = require("@/app/investments/handlers/LogInvestmentChangesHandler")
const investmentModel = require("@/models/Investments")
const CompleteInvestmentHandler = require("@/app/investments/handlers/CompleteInvestmentHandler")
const ValidateInvestmentOwnershipHandler = require("@/app/investments/handlers/ValidateInvestmentOwnershipHandler")
const GetActivePresetsHandler = require("@/app/investments/handlers/GetActivePresetsHandler")
const WrapperPresetsHandler = require("@/app/investments/handlers/WrapperPresetsHandler")
const FetchActiveInvestmentsHandler = require("@/app/investments/handlers/FetchActiveInvestmentsHandler")
const CalculateAccrualsHandler = require("@/app/investments/handlers/CalculateAccrualsHandler")
const InsertAccrualsHandler = require("@/app/investments/handlers/InsertAccrualsHandler")
const RemoveFieldsHandler = require("@/handlers/RemoveFieldsHandler")

class Service {
  #allowedRoles
  #allowedPresets
  #allowedStatuses
  constructor() {
    this.#allowedRoles = ["super_admin", "fin_admin"]
    this.#allowedPresets = ["conservative", "balanced", "aggressive", "custom"]
    this.#allowedStatuses = ["active", "draft", "paused", "closed"]
    this.model = investmentModel
    this.stringTypesField = ["status", "strategy_type", "preset_type"]
  }

  async store(user_id, data) {
    const context = {
      body: { ...data, user_id },
      errors: [],
      insertId: null
    }
    const chain = new TrimFieldsHandler(this.stringTypesField)
    chain
      .setNext(new ValidatePresetTypeHandler(this.#allowedPresets))
      .setNext(new NormalizePostHandler())
      .setNext(new ValidatePostStructureHandler())
      .setNext(new CheckUserBalanceHandler())
      .setNext(new CreateInvestmentHandler())
      .setNext(new EmitBalanceUpdateHandler())
    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }

  async getUserInvestmentsByStatus({ userId, settings }) {
    const context = { errors: [], body: {}, settings, userId }

    const chain = new CheckAvailableStatusHandler(this.#allowedStatuses)
    chain
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetUserInvestmentsByStatusHandler())
      .setNext(new TotalUserInvestmentsByStatuses())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async indexStatus({ settings, editorId }) {
    const context = { errors: [], body: {}, settings, editorId }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new CheckAvailableStatusHandler(this.#allowedStatuses))
      .setNext(new CheckPaginationParamsHandler())
      .setNext(new GetPostsByStatusHandler())
      .setNext(new TotalByStatusHandler())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async update({ postData, editorId }) {
    const context = { editorId, errors: [], body: postData }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new PrepareDataHandler(["status", "preset_type", "id"]))
      .setNext(new LogInvestmentChangesHandler())
      .setNext(new UpdateByIdHandler(this.model))

    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }

  async updateByUser({ postData, userId }) {
    const context = {
      userId: Number(userId),
      investmentId: postData.id,
      errors: [],
      body: { ...postData, user_id: Number(userId) }
    }

    const chain = new ValidateInvestmentOwnershipHandler()
    chain
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new PrepareDataHandler(["preset_type", "id"]))
      .setNext(new ValidatePresetTypeHandler(this.#allowedPresets))
      .setNext(new LogInvestmentChangesHandler())
      .setNext(new UpdateByIdHandler(this.model))

    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }

  async completeInvestment({ userId, investmentId }) {
    const context = {
      errors: [],
      body: { user_id: userId },
      investmentId
    }

    const chain = new ValidateInvestmentOwnershipHandler()
    chain
      .setNext(new CompleteInvestmentHandler())
      .setNext(new EmitBalanceUpdateHandler())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async getUserInvestmentById({ userId, investmentId }) {
    const context = {
      errors: [],
      userId,
      investmentId,
      body: { user_id: Number(userId) }
    }

    const chain = new ValidateInvestmentOwnershipHandler()
    chain.setNext(new GetUserInvestmentByIdHandler())

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async getPostById({ id, editorId }) {
    const context = { editorId, errors: [], body: {}, data: { id } }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostByIdHandler(this.model))

    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }

  async getActivePresets() {
    const context = {
      errors: [],
      body: {},
      settings: { limit: 1000, offset: 0 }
    }

    const chain = new GetActivePresetsHandler()
    chain
      .setNext(new WrapperPresetsHandler())
      .setNext(new RemoveFieldsHandler(["posts"]))

    const { errors, body } = await chain.handle(context)
    return errors.length ? { errors, status: "error" } : { body, status: "ok" }
  }

  async dailyAccrual() {
    const context = {
      body: {},
      errors: [],
      settings: {
        statuses: ["active"],
        limit: 100000000000
      }
    }

    const chain = new FetchActiveInvestmentsHandler(investmentModel)
    chain
      .setNext(new GetActivePresetsHandler())
      .setNext(new CalculateAccrualsHandler())
      .setNext(new InsertAccrualsHandler())

    const { errors } = await chain.handle(context)

    return {
      status: errors.length ? "error" : "ok",
      errors
    }
  }
}
module.exports = new Service()
