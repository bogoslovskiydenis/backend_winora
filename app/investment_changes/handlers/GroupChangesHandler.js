const BaseHandler = require("@/core/BaseHandler")

module.exports = class GroupChangesHandler extends BaseHandler {
    async handle(context) {
        const {
            errors,
            rawAdminRows = [],
            rawSelfRows = [],
            adminsById = {},
            usersById = {}
        } = context
        if (errors.length > 0) return context

        function groupRows(rows, resolveEditor, resolveUserId) {
            const map = new Map()
            for (const r of rows) {
                const key = r.transaction_id || `${r.investment_id}-${r.edited_at}-${r.field}`
                if (!map.has(key)) {
                    map.set(key, {
                        investment_id: r.investment_id,
                        user_id: resolveUserId(r),
                        editor: resolveEditor(r),
                        changed_at: r.edited_at,
                        old_value: {},
                        new_value: {}
                    })
                }
                const item = map.get(key)
                if (r.edited_at > item.changed_at) item.changed_at = r.edited_at
                item.old_value[r.field] = r.old_value
                item.new_value[r.field] = r.new_value
            }
            return Array.from(map.values())
        }

        const admin = groupRows(
            rawAdminRows,
            (r) => adminsById[r.changed_by_admin_id] || String(r.changed_by_admin_id || ""),
            (r) => r.changed_by_admin_id
        )
        const self = groupRows(
            rawSelfRows,
            (r) => usersById[r.changed_by_user_id] || String(r.changed_by_user_id || ""),
            (r) => r.changed_by_user_id
        )

        context.body = { admin, self }
        return super.handle(context)
    }
}


