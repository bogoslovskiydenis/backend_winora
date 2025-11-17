const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")

module.exports = class CheckPostPermissionHandler extends BaseHandler {
  constructor(allowedRoles = ["super_admin"]) {
    super()
    this.allowedRoles = allowedRoles
  }

  async handle(context) {
    const { editorId, errors } = context
    if (errors.length > 0) return context
    if (!editorId) {
      errors.push("Пользователь не авторизован")
      return context
    }
    const adminModel = new AdminUsers()
    const user = await adminModel.getUserById(editorId)
    if (!user || !user.role) {
      errors.push("Пользователь не авторизован")
      return context
    }
    if (!this.allowedRoles.includes(user.role)) {
      errors.push("У вас нет прав на редактирование этой записи")
      return context
    }
    return super.handle(context)
  }
}
