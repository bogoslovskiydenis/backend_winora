const BaseHandler = require("@/core/BaseHandler")
const investmentChanges = require("@/models/InvestmentChanges")

module.exports = class GetDistinctAdminIdsHandler extends BaseHandler {
    constructor() {
        super()
        this.model = investmentChanges
    }

    async handle(context) {
        const { errors, investmentId } = context

        if (errors.length > 0) return context

        if (!investmentId) {
            errors.push("Не указан ID инвестиции")
            return context
        }

        try {
            const adminIds = await this.model.getDistinctAdminIdByInvestmentId(
                investmentId
            )
            context.adminIds = adminIds
        } catch (err) {
            errors.push(`Ошибка при получении админов: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

