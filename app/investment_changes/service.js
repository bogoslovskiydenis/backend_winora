const GetDistinctAdminIdsHandler = require("@/app/investment_changes/handlers/GetDistinctAdminIdsHandler")
const GetAdminUsersByIdsHandler = require("@/app/investment_changes/handlers/GetAdminUsersByIdsHandler")
const GetDistinctFieldsHandler = require("@/app/investment_changes/handlers/GetDistinctFieldsHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")

class InvestmentChangesService {
    #allowedRoles
    constructor() {
        this.#allowedRoles = ["super_admin", "fin_admin"]
    }

    // eslint-disable-next-line no-unused-vars
    async getPostByInvestmentId(investmentId) {
        // TODO: Реализация получения изменений инвестиции
        return null
    }

    async getDistinctAdminByInvestmentId(investmentId, editorId) {
        const context = {
            errors: [],
            editorId,
            investmentId: Number(investmentId)
        }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain
            .setNext(new GetDistinctAdminIdsHandler())
            .setNext(new GetAdminUsersByIdsHandler())

        const { errors, body } = await chain.handle(context)

        if (errors.length > 0) {
            throw new Error(errors.join(", "))
        }

        return body || []
    }

    async getDistinctFieldsByInvestmentId(investmentId, editorId) {
        const context = {
            errors: [],
            editorId,
            investmentId: Number(investmentId)
        }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain.setNext(new GetDistinctFieldsHandler())

        const { errors, body } = await chain.handle(context)

        if (errors.length > 0) {
            throw new Error(errors.join(", "))
        }

        return body || []
    }

    // eslint-disable-next-line no-unused-vars
    async filters(investmentId, settings) {
        // TODO: Реализация фильтрации изменений
        return {
            admin: [],
            self: []
        }
    }

    // eslint-disable-next-line no-unused-vars
    async report(adminId, self, admin) {
        // TODO: Реализация генерации отчета
        return ""
    }
}

module.exports = new InvestmentChangesService()

