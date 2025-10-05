const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")

module.exports = class CheckPostPermissionHandler extends BaseHandler {
  /**
   * @param {Array<string>} allowedRoles — роли, которым разрешён доступ
   */
  constructor(allowedRoles = ["super_admin"]) {
    super()
    this.allowedRoles = allowedRoles
  }

  async handle(context) {
    const { data, errors } = context
    const adminModel = new AdminUsers()
    const user = await adminModel.getUserById(data.editorId)
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
