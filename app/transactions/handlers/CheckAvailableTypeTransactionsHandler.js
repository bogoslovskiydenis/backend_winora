const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckAvailableTypeTransactionsHandler extends (
  BaseHandler
) {
  constructor(allowedTypes = []) {
    super()
    this.allowedType = allowedTypes
  }

  async handle(context) {
    const { settings, errors } = context
    const { url } = settings
    if (!this.allowedType.includes(url)) errors.push("Поле статус не валидно")
    if (errors.length) return context
    return super.handle(context)
  }
}
