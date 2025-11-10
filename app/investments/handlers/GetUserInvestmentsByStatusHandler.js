const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")

module.exports = class GetUserInvestmentsByStatusHandler extends BaseHandler {
  constructor() {
    super()
    this.model = investmentsModel
  }

  async handle(context) {
    const { errors, settings, userId } = context
    if (errors.length > 0) return context
    try {
      context.body.posts = await this.model.getUserPostsByStatus(
        userId,
        settings
      )
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
