const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")

module.exports = class FetchActiveInvestmentsHandler extends BaseHandler {
  constructor() {
    super()
    this.model = investmentsModel
  }

  async handle(context) {
    const { errors, settings, body } = context

    if (errors.length > 0) return context

    try {
      body.investments = await this.model.findByStatuses(settings)
    } catch (err) {
      errors.push(`Ошибка при получении активных инвестиций: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
