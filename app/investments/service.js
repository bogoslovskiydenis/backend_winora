const ValidatePostStructureHandler = require("@/app/investments/handlers/ValidatePostStructureHandler")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")
const NormalizePostHandler = require("@/app/investments/handlers/NormalizePostHandler")
const CheckUserBalanceHandler = require("@/handlers/CheckUserBalanceHandler")
const EmitBalanceUpdateHandler = require("@/handlers/EmitBalanceUpdateHandler")
const CreateInvestmentHandler = require("@/app/investments/handlers/CreateInvestmentHandler")
const ValidatePresetTypeHandler = require("@/handlers/ValidatePresetTypeHandler")
const investmentModel = require("@/models/Investments")

class Service {
  #allowedRoles
  #allowedPresets
  constructor() {
    this.#allowedRoles = ["super_admin", "fin_admin"]
    this.#allowedPresets = ["conservative", "balanced", "aggressive", "custom"]
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
}
module.exports = new Service()
