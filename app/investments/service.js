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
const TotalUserInvestmentsByStatuses = require("@/app/investments/handlers/TotalUserInvestmentsByStatuses")
const investmentModel = require("@/models/Investments")

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
}
module.exports = new Service()
