const BaseHandler = require("@/core/BaseHandler")

module.exports = class NormalizeAmountHandler extends BaseHandler {
    async handle(context) {
        const { errors, body = {} } = context
        if (errors.length > 0) return context

        const { amount } = body

        if (amount === undefined || amount === null || amount === "") {
            errors.push("Не указана сумма")
            return context
        }

        const numericAmount = Number(amount)

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            errors.push("Сумма должна быть числом больше 0")
            return context
        }

        body.amount = numericAmount

        return super.handle(context)
    }
}


