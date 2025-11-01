const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckAvailableOrderKeyHandler extends BaseHandler {
  constructor(allowedTypes = []) {
    super()
    this.allowedOrderKey = allowedTypes
  }

  async handle(context) {
    const { settings, errors } = context
    const { orderKey } = settings
    if (!this.allowedOrderKey.includes(orderKey)) {
      errors.push("Недопустимое значение ключа сортировки")
      return context
    }
    return super.handle(context)
  }
}
