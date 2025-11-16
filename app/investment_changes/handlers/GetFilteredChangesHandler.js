const BaseHandler = require("@/core/BaseHandler")
const InvestmentChanges = require("@/models/InvestmentChanges")

module.exports = class GetFilteredChangesHandler extends BaseHandler {
    constructor() {
        super()
        this.model = new InvestmentChanges()
    }

    async handle(context) {
        const { errors, investmentId, settings = {} } = context
        if (errors.length > 0) return context
        if (!investmentId) {
            errors.push("Не указан ID инвестиции")
            return context
        }

        const { field, editor, periodFrom, periodTo } = settings

        try {
            // admin
            const adminRows = await this.model.getChangesWithFiltersByInvestmentId(
                Number(investmentId),
                {
                    change_source: editor === "self" ? undefined : "admin",
                    field,
                    periodFrom,
                    periodTo
                }
            )
            // self
            const selfRows = await this.model.getChangesWithFiltersByInvestmentId(
                Number(investmentId),
                {
                    change_source: editor === "admin" ? undefined : "self",
                    field,
                    periodFrom,
                    periodTo
                }
            )

            context.rawAdminRows = adminRows
            context.rawSelfRows = selfRows
        } catch (err) {
            errors.push(`Ошибка получения изменений: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}


