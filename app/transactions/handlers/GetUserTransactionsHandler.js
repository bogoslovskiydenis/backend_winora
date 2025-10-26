const BaseHandler = require("@/core/BaseHandler")
const transactionsModel = require("@/models/Transactions")
const { settings } = require("express/lib/application")

module.exports = class GetUserTransactionsHandler extends BaseHandler {
  constructor() {
    super()
    this.model = transactionsModel
  }

  async handle(context) {
    const { errors, userId, settings } = context
    if (errors.length > 0) return context
    try {
      context.body.posts = await this.model.findByUser(userId, settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
