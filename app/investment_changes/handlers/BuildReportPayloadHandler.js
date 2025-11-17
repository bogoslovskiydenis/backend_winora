const BaseHandler = require("@/core/BaseHandler")

module.exports = class BuildReportPayloadHandler extends BaseHandler {
    async handle(context) {
        const { errors, payload } = context
        if (errors.length > 0) return context
        if (!payload || typeof payload !== "object") {
            errors.push("Пустые данные для отчета")
            return context
        }

        const { admin = [], self = [] } = payload
        const dataAdmin = []
        const dataSelf = []

        for (const item of admin) {
            const { changed_at, editor, investment_id, user_id } = item
            const fields = Object.keys(item.new_value || {})
            for (const key of fields) {
                dataAdmin.push({
                    investment_id,
                    user_id,
                    editor,
                    changed_at,
                    field: key,
                    old_value: item.old_value ? item.old_value[key] : undefined,
                    new_value: item.new_value ? item.new_value[key] : undefined
                })
            }
        }

        for (const item of self) {
            const { changed_at, editor, investment_id, user_id } = item
            const fields = Object.keys(item.new_value || {})
            for (const key of fields) {
                dataSelf.push({
                    investment_id,
                    user_id,
                    editor,
                    changed_at,
                    field: key,
                    old_value: item.old_value ? item.old_value[key] : undefined,
                    new_value: item.new_value ? item.new_value[key] : undefined
                })
            }
        }

        context.reportData = { admin_changes: dataAdmin, self_changes: dataSelf }
        return super.handle(context)
    }
}


