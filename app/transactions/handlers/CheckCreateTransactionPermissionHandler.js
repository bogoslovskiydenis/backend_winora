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
    try {
      const user = await frontUserModel.checkSession(userId, session)
      if (!user) {
        errors.push("Пользователь не авторизован")
        return context
      }
      if (user.role !== "user") {
        errors.push("У вас нет прав на редактирование этой записи")
        return context
      }
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
