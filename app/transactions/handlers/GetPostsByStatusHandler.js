const BaseHandler = require("@/core/BaseHandler")
const transactionsModel = require("@/models/Transactions")

module.exports = class GetPostsByStatusHandler extends BaseHandler {
  constructor() {
    super()
    this.model = transactionsModel
  }

  async handle(context) {
    const { errors, settings } = context
    if (errors.length > 0) return context
    try {
      context.body.posts = await this.model.findByStatuses(settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
