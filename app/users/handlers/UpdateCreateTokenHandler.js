const BaseHandler = require("@/core/BaseHandler")
const FrontUsersModel = require("@/models/FrontUsers")

module.exports = class UpdateCreateTokenHandler extends BaseHandler {
  constructor(value) {
    super()
    this.create_token = value
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
      await this.model.updateCreateTokenById(user.id, this.create_token)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
