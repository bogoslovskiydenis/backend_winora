const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")
const investmentAccrualsModel = require("@/models/InvestmentAccrualsModel")

module.exports = class GetUserInvestmentByIdHandler extends BaseHandler {
    constructor() {
        super()
        this.model = investmentsModel
        this.accrualsModel = investmentAccrualsModel
    }

    async handle(context) {
        const { errors, investmentId, investment } = context

        if (errors.length > 0) return context

        if (!investment) {
            errors.push("Инвестиция не найдена")
            return context
        }

        try {
            const accruals = await this.accrualsModel.getTotalAccruedByInvestmentIds([
                investmentId
            ])

            const totalAccrued =
                accruals.length > 0 ? parseFloat(accruals[0].total_accrued) || 0 : 0

            context.body = {
                ...investment,
                total_accrued: totalAccrued
            }
        } catch (err) {
            errors.push(`Ошибка при работе с базой: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

