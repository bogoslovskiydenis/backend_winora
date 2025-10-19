const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckAvailableStatusTransactionsHandler extends (
  BaseHandler
) {
  constructor(allowedStatuses = []) {
    super()
    this.allowedStatuses = allowedStatuses
  }

  async handle(context) {
    const { settings, errors } = context
    const { url } = settings
    console.log(url)
    if (!this.allowedStatuses.includes(url))
      errors.push("Поле статус не валидно")
    if (errors.length) return context
    return super.handle(context)
  }
}
