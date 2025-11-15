const BaseHandler = require("@/core/BaseHandler")
const loggerInvestmentChanges = require("@/models/LoggerInvestmentChanges")
const investmentsModel = require("@/models/Investments")
const AdminUsers = require("@/models/AdminUsers")
const { diffObjects } = require("@/helpers/functions")
const crypto = require("crypto")

module.exports = class LogInvestmentChangesHandler extends BaseHandler {
    constructor() {
        super()
        this.logger = loggerInvestmentChanges
        this.adminModel = new AdminUsers()
    }

    async handle(context) {
        const { prepareData, errors, editorId, userId } = context

        if (errors.length > 0) return context

        if (!prepareData || !prepareData.id) {
            return super.handle(context)
        }

        try {
            const oldInvestment = await investmentsModel.getPostById(prepareData.id)
            if (!oldInvestment) {
                errors.push("Инвестиция не найдена")
                return context
            }

            const { id, ...newData } = prepareData
            const diff = diffObjects(newData, oldInvestment)

            if (diff.length > 0) {
                const transactionId = crypto.randomBytes(16).toString("hex")
                let changeSource = null
                let changedByUserId = null
                let changedByAdminId = null

                if (editorId) {
                    const adminUser = await this.adminModel.getUserById(editorId)
                    if (adminUser) {
                        changeSource = "admin"
                        changedByAdminId = editorId
                    }
                } else if (userId) {
                    changeSource = "self"
                    changedByUserId = userId
                }

                if (!changeSource) {
                    errors.push("Не удалось определить источник изменений")
                    return context
                }

                for (const diffItem of diff) {
                    const logData = {
                        investment_id: id,
                        transaction_id: transactionId,
                        field: diffItem.field,
                        old_value: String(diffItem.old_value ?? ""),
                        new_value: String(diffItem.new_value ?? ""),
                        change_source: changeSource,
                        changed_by_user_id: changedByUserId,
                        changed_by_admin_id: changedByAdminId
                    }
                    await this.logger.insert(logData)
                }
            }
        } catch (err) {
            errors.push(`Ошибка при логировании изменений: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

