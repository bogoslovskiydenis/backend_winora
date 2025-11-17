const GetDistinctAdminIdsHandler = require("@/app/investment_changes/handlers/GetDistinctAdminIdsHandler")
const GetAdminUsersByIdsHandler = require("@/app/investment_changes/handlers/GetAdminUsersByIdsHandler")
const GetDistinctFieldsHandler = require("@/app/investment_changes/handlers/GetDistinctFieldsHandler")
const GetFilteredChangesHandler = require("@/app/investment_changes/handlers/GetFilteredChangesHandler")
const MapEditorsHandler = require("@/app/investment_changes/handlers/MapEditorsHandler")
const GroupChangesHandler = require("@/app/investment_changes/handlers/GroupChangesHandler")
const BuildReportPayloadHandler = require("@/app/investment_changes/handlers/BuildReportPayloadHandler")
const GenerateReportHandler = require("@/app/investment_changes/handlers/GenerateReportHandler")
const SendReportEmailHandler = require("@/app/investment_changes/handlers/SendReportEmailHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")

class InvestmentChangesService {
    #allowedRoles
    constructor() {
        this.#allowedRoles = ["super_admin", "fin_admin"]
    }

    async getPostByInvestmentId(investmentId, editorId) {
        const context = {
            errors: [],
            editorId,
            investmentId: Number(investmentId)
        }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain
            .setNext(new GetFilteredChangesHandler())
            .setNext(new MapEditorsHandler())
            .setNext(new GroupChangesHandler())

        const { errors, body } = await chain.handle(context)
        if (errors.length > 0) {
            throw new Error(errors.join(", "))
        }
        return { id: Number(investmentId), ...(body || { admin: [], self: [] }) }
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

    async filters(investmentId, settings = {}, editorId) {
        const context = {
            errors: [],
            editorId,
            investmentId: Number(investmentId),
            settings
        }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain
            .setNext(new GetFilteredChangesHandler())
            .setNext(new MapEditorsHandler())
            .setNext(new GroupChangesHandler())

        const { errors, body } = await chain.handle(context)
        if (errors.length > 0) {
            throw new Error(errors.join(", "))
        }
        return body
    }

    async report(adminId, self = [], admin = []) {
        const context = {
            errors: [],
            editorId: adminId,
            payload: { admin, self },
            reportPath: ""
        }

        const chain = new CheckPostPermissionHandler(this.#allowedRoles)
        chain
            .setNext(new BuildReportPayloadHandler())
            .setNext(new GenerateReportHandler())
            .setNext(new SendReportEmailHandler())

        const { errors, reportPath } = await chain.handle(context)
        if (errors.length > 0) {
            throw new Error(errors.join(", "))
        }
        return reportPath
    }
}

module.exports = new InvestmentChangesService()

