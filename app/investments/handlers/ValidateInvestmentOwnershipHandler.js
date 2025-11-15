const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")

module.exports = class ValidateInvestmentOwnershipHandler extends BaseHandler {
    constructor() {
        super()
        this.model = investmentsModel
    }

    async handle(context) {
        const { investmentId, errors, body } = context
        const { user_id } = body

        if (errors.length > 0) return context

        if (!user_id || !investmentId) {
            errors.push("Не указан пользователь или инвестиция")
            return context
        }

        try {
            const investment = await this.model.getPostById(investmentId)

            if (!investment) {
                errors.push("Инвестиция не найдена")
                return context
            }

            if (investment.user_id !== user_id) {
                errors.push("Инвестиция не принадлежит данному пользователю")
                return context
            }

            if (investment.status !== "active") {
                errors.push("Инвестиция не активна")
                return context
            }

            context.investment = investment
        } catch (err) {
            errors.push(`Ошибка при проверке инвестиции: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

