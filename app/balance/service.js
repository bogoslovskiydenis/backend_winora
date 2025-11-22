const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const CheckBalanceOperationHandler = require("@/app/balance/handlers/CheckBalanceOperationHandler")
const CheckBalanceCurrencyHandler = require("@/app/balance/handlers/CheckBalanceCurrencyHandler")
const NormalizeAmountHandler = require("@/handlers/NormalizeAmountHandler")
const CheckBalanceAvailabilityHandler = require("@/app/balance/handlers/CheckBalanceAvailabilityHandler")
const ExecuteBalanceOperationHandler = require("@/app/balance/handlers/ExecuteBalanceOperationHandler")
const EmitBalanceUpdateHandler = require("@/handlers/EmitBalanceUpdateHandler")

class Service {
  #allowedRoles
  constructor() {
    this.#allowedRoles = ["super_admin", "fin_admin"]
    this.stringTypesField = ["comment"]
    this.allowedOperations = ["deposit", "withdraw", "freeze", "unfreeze"]
    this.allowedCurrencies = ["USDT", "W_TOKEN"]
  }
  async processOperation({
    operation,
    editorId,
    user_id,
    amount,
    currency,
    comment
  }) {
    const context = {
      errors: [],
      body: { operation, editorId, user_id, amount, currency, comment }
    }

    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new CheckBalanceOperationHandler(this.allowedOperations))
      .setNext(new CheckBalanceCurrencyHandler(this.allowedCurrencies))
      .setNext(new NormalizeAmountHandler())
      .setNext(new CheckBalanceAvailabilityHandler())
      .setNext(new ExecuteBalanceOperationHandler())
      .setNext(new EmitBalanceUpdateHandler())

    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }
}
module.exports = new Service()
