const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const CheckBalanceOperationHandler = require("@/app/balance/handlers/CheckBalanceOperationHandler")
class Service {
    #allowedRoles
    constructor() {
        this.#allowedRoles = ["super_admin", "fin_admin"]
        this.stringTypesField = ["comment"]
        this.allowedOperations = ["deposit", "withdrawal", "locked", "unlocked"]
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
        chain.setNext(new CheckBalanceOperationHandler(this.allowedOperations))

        const { errors, body } = await chain.handle(context)
        return { errors, body, status: errors.length ? "error" : "ok" }
    }
}
module.exports = new Service()
