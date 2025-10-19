const BaseHandler = require("@/core/BaseHandler")
const FrontUsers = require("@/models/FrontUsers")

module.exports = class CheckCreateTransactionPermissionHandler extends (
  BaseHandler
) {
  constructor() {
    super()
  }

  async handle(context) {
    const { body, errors } = context
    const { userId, session } = body
    const frontUserModel = new FrontUsers()
    if (!userId) {
      errors.push("userId не указан")
    }
    if (!session) {
      errors.push("session не указан")
    }
    try {
      const user = await frontUserModel.checkSession(userId, session)
      if (!user) {
        errors.push("Пользователь не авторизован")
      }
      if (user.role !== "user") {
        errors.push("У вас нет прав на редактирование этой записи")
      }
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    if (errors.length > 0) return context
    return super.handle(context)
  }
}
