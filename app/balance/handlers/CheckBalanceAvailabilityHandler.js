const BaseHandler = require("@/core/BaseHandler")
const userBalanceModel = require("@/models/UserBalance")

module.exports = class CheckBalanceAvailabilityHandler extends BaseHandler {
    constructor() {
        super()
        this.balanceModel = userBalanceModel
        this.operationsRequireAvailable = ["withdraw", "freeze"]
        this.operationsRequireLocked = ["unfreeze"]
    }

    async handle(context) {
        const { errors, body = {} } = context
        if (errors.length > 0) return context

        const { operation, userId, amount, currency } = body

        const requiresAvailable = this.operationsRequireAvailable.includes(operation)
        const requiresLocked = this.operationsRequireLocked.includes(operation)

        if (!requiresAvailable && !requiresLocked) {
            return super.handle(context)
        }

        try {
            const balance = await this.balanceModel.findByUserId(userId, currency)

            if (!balance) {
                errors.push("Баланс пользователя не найден")
                return context
            }

            const available = Number(balance.balance || 0)
            const locked = Number(balance.locked_balance || 0)

            if (requiresAvailable && available < amount) {
                errors.push("Недостаточно средств на счету")
                return context
            }

            if (requiresLocked && locked < amount) {
                errors.push("Недостаточно замороженных средств")
                return context
            }

        } catch (err) {
            errors.push("Ошибка проверки баланса: " + err.message)
            return context
        }

        return super.handle(context)
    }
}


