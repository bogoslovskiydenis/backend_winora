const BaseHandler = require("@/core/BaseHandler")

const DEFAULT_OPERATIONS = ["deposit", "withdraw", "freeze", "unfreeze"]

module.exports = class CheckBalanceOperationHandler extends BaseHandler {
    constructor(allowedOperations = DEFAULT_OPERATIONS) {
        super()
        this.allowedOperations = allowedOperations
    }

    async handle(context) {
        const { errors, body = {} } = context
        const { operation } = body
        if (errors.length > 0) return context

        if (!operation) {
            errors.push("Не указана операция с балансом")
            return context
        }

        if (!this.allowedOperations.includes(operation)) {
            errors.push("Операция с балансом недоступна")
            return context
        }

        return super.handle(context)
    }
}

