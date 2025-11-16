const BaseHandler = require("@/core/BaseHandler")
const InvestmentChanges = require("@/models/InvestmentChanges")

module.exports = class GetDistinctFieldsHandler extends BaseHandler {
    constructor() {
        super()
        this.model = new InvestmentChanges()
    }

    async handle(context) {
        const { errors, investmentId } = context

        if (errors.length > 0) return context

        if (!investmentId) {
            errors.push("Не указан ID инвестиции")
            return context
        }

        try {
            const fields = await this.model.getDistinctFieldsByInvestmentId(
                investmentId
            )
            context.body = fields
        } catch (err) {
            errors.push(`Ошибка при получении полей: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

