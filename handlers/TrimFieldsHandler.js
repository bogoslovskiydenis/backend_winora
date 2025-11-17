const BaseHandler = require("@/core/BaseHandler")

module.exports = class TrimFieldsHandler extends BaseHandler {
  constructor(fieldsToTrim = []) {
    super()
    this.fieldsToTrim = fieldsToTrim
  }

  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    if (!body || typeof body !== "object") {
      errors.push("Данные для обработки не найдены")
      return context
    }

    for (const field of this.fieldsToTrim) {
      if (typeof body[field] === "string") {
        body[field] = body[field].trim()
      }
    }

    return super.handle(context)
  }
}
