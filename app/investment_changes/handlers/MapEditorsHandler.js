const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")
const FrontUsers = require("@/models/FrontUsers")

module.exports = class MapEditorsHandler extends BaseHandler {
    constructor() {
        super()
        this.adminModel = new AdminUsers()
        this.frontUsersModel = new FrontUsers()
    }

    async handle(context) {
        const { errors, rawAdminRows = [], rawSelfRows = [] } = context
        if (errors.length > 0) return context

        try {
            const adminIds = Array.from(
                new Set(rawAdminRows.map((r) => r.changed_by_admin_id).filter(Boolean))
            )
            const userIds = Array.from(
                new Set(rawSelfRows.map((r) => r.changed_by_user_id).filter(Boolean))
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

            context.adminsById = adminsById
            context.usersById = usersById
        } catch (err) {
            errors.push(`Ошибка загрузки редакторов: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}


