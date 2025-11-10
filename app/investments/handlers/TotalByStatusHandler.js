const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")

module.exports = class TotalByStatusHandler extends BaseHandler {
  constructor() {
    super()
    this.model = investmentsModel
  }

  async handle(context) {
    const { errors, settings } = context
    if (errors.length > 0) return context
    const { statuses } = settings
    try {
      context.body.total = await this.model.totalByStatuses(statuses)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
