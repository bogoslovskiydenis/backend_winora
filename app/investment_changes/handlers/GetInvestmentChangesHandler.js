const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")
const FrontUsers = require("@/models/FrontUsers")
const InvestmentChanges = require("@/models/InvestmentChanges")

module.exports = class GetInvestmentChangesHandler extends BaseHandler {
    constructor() {
        super()
        this.adminModel = new AdminUsers()
        this.frontUsersModel = new FrontUsers()
        this.changesModel = new InvestmentChanges()
    }

    async handle(context) {
        const { errors, investmentId } = context
        if (errors.length > 0) return context
        if (!investmentId) {
            errors.push("Не указан ID инвестиции")
            return context
        }

        try {
            const rowsData = await this.changesModel.getChangesByInvestmentId(investmentId)

            const adminRows = rowsData.filter((r) => r.change_source === "admin")
            const selfRows = rowsData.filter((r) => r.change_source === "self")

            const adminIds = Array.from(
                new Set(adminRows.map((r) => r.changed_by_admin_id).filter(Boolean))
            )
            const userIds = Array.from(
                new Set(selfRows.map((r) => r.changed_by_user_id).filter(Boolean))
            )

            let adminsById = {}
            if (adminIds.length) {
                const admins = await this.adminModel.getUsersByIds(adminIds)
                for (const it of admins) {
                    adminsById[it.id] = it.name
                }
            }

            const usersById = {}
            for (const uid of userIds) {
                const u = await this.frontUsersModel.getUserById(uid)
                if (u) usersById[uid] = u.login
            }

            function groupRows(rows, getEditor) {
                const map = new Map()
                for (const r of rows) {
                    const key = r.transaction_id || `${r.investment_id}-${r.edited_at}-${r.field}`
                    if (!map.has(key)) {
                        map.set(key, {
                            investment_id: r.investment_id,
                            editor: getEditor(r),
                            changed_at: r.edited_at,
                            old_value: {},
                            new_value: {}
                        })
                    }
                    const item = map.get(key)
                    // обновляем дату на максимальную в транзакции
                    if (r.edited_at > item.changed_at) item.changed_at = r.edited_at
                    item.old_value[r.field] = r.old_value
                    item.new_value[r.field] = r.new_value
                }
                return Array.from(map.values())
            }

            const admin = groupRows(adminRows, (r) => {
                return adminsById[r.changed_by_admin_id] || String(r.changed_by_admin_id || "")
            })
            const self = groupRows(selfRows, (r) => {
                return usersById[r.changed_by_user_id] || String(r.changed_by_user_id || "")
            })

            context.body = { id: Number(investmentId), admin, self }
        } catch (err) {
            errors.push(`Ошибка получения изменений: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}


