const BaseHandler = require("@/core/BaseHandler")

module.exports = class NormalizeInvestmentHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const numericFields = ["user_id", "amount_usd", "custom_preset_id"]

    for (const field of numericFields) {
      const value = body[field]
      if (value == null || value === "") continue

      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`Поле "${field}" должно быть числом`)
      } else {
        body[field] = num
      }
    }
    if (errors.length > 0) {
      return context
    }
    return super.handle(context)
  }
}
