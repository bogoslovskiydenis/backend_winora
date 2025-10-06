const BaseHandler = require("@/core/BaseHandler")

module.exports = class NormalizePostHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    const normalizeFields = ["depositAmount", "order"]
    for (const field of normalizeFields) {
      const value = data[field]
      if (value == null) continue
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`Поле "${field}" должно быть числом`)
      } else {
        data[field] = num
      }
    }
    if (errors.length > 0) {
      return context
    }
    return super.handle(context)
  }
}
