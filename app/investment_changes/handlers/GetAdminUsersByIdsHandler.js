const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")

module.exports = class GetAdminUsersByIdsHandler extends BaseHandler {
    constructor() {
        super()
        this.adminModel = new AdminUsers()
    }

    async handle(context) {
        const { errors, adminIds } = context

        if (errors.length > 0) return context

        if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
            context.body = []
            return super.handle(context)
        }

        try {
            const admins = await this.adminModel.getUsersByIds(adminIds)
            context.body = admins.map(({ name }) => name)
        } catch (err) {
            errors.push(`Ошибка при получении данных админов: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}

