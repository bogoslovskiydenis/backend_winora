const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const CheckBalanceOperationHandler = require("@/app/balance/handlers/CheckBalanceOperationHandler")
const CheckBalanceCurrencyHandler = require("@/app/balance/handlers/CheckBalanceCurrencyHandler")

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
        userId,
        amount,
        currency,
        comment
    }) {
        const context = { errors: [], body: { operation, editorId, userId, amount, currency, comment } }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain
            .setNext(new CheckBalanceOperationHandler(this.allowedOperations))
            .setNext(new CheckBalanceCurrencyHandler(this.allowedCurrencies))

        const { errors, body } = await chain.handle(context)
        return { errors, body, status: errors.length ? "error" : "ok" }
    }
}
module.exports = new Service()
