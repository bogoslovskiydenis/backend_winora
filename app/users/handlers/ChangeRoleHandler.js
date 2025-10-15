const BaseHandler = require("@/core/BaseHandler")
const FrontUsersModel = require("@/models/FrontUsers")

module.exports = class ChangeRoleHandlers extends BaseHandler {
  constructor(role) {
    super()
    this.role = role
    this.model = new FrontUsersModel()
  }

  async handle(context) {
    const { errors, body } = context
    if (errors.length > 0) return context
    try {
      const { user } = body
      if (!user) {
        errors.push(`Поле user отсутствует`)
        return context
      }
      await this.model.changeRole(user.id, "user")
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
