const BaseHandler = require("@/core/BaseHandler")
const FrontUsersModel = require("@/models/FrontUsers")

module.exports = class ConfirmationRegistrationHandler extends BaseHandler {
  constructor(token) {
    super()
    this.tokem = token
    this.model = new FrontUsersModel()
  }

  async handle(context) {
    const { errors, body } = context
    if (errors.length > 0) return context
    try {
      const candidate = await this.model.confirmationRegistration(this.tokem)
      if (!candidate) {
        errors.push("Не валидный токен")
        return context
      }
      body.user = candidate
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
