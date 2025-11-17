const BaseHandler = require("@/core/BaseHandler")
const ReportService = require("@/core/ReportService")
const crypto = require("crypto")

module.exports = class GenerateReportHandler extends BaseHandler {
    constructor() {
        super()
        this.reportService = new ReportService()
    }

    async handle(context) {
        const { errors, reportData } = context
        if (errors.length > 0) return context
        if (!reportData) {
            errors.push("Нет данных для отчета")
            return context
        }

        try {
            const token = crypto.randomBytes(16).toString("hex")
            const reportPath = await this.reportService.report(reportData, `${token}.xlsx`)
            context.reportPath = reportPath
        } catch (err) {
            errors.push(`Ошибка генерации отчета: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}


