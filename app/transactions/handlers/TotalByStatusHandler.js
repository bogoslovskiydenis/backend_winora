const BaseHandler = require("@/core/BaseHandler")
const transactionsModel = require("@/models/Transactions")

module.exports = class TotalByStatusHandler extends BaseHandler {
  constructor() {
    super()
    this.model = transactionsModel
  }

  async handle(context) {
    const { errors, settings } = context
    if (errors.length > 0) return context
    const { url: status } = settings
    try {
      context.body.total = await this.model.totalByStatus(status)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
