const BaseHandler = require("@/core/BaseHandler")
const userBalanceModel = require("@/models/UserBalance")

module.exports = class ChangeRoleHandlers extends BaseHandler {
  constructor(currency) {
    super()
    this.currency = currency
    this.model = userBalanceModel
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
      await this.model.insert({ user_id: user.id, currency: this.currency })
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
