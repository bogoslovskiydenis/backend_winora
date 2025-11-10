const BaseHandler = require("@/core/BaseHandler")

module.exports = class TrimFieldsHandler extends BaseHandler {
  constructor(fieldsToTrim = []) {
    super()
    this.fieldsToTrim = fieldsToTrim
  }

  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context

    for (const field of this.fieldsToTrim) {
      if (typeof body[field] === "string") {
        body[field] = body[field].trim()
      }
    }

    return super.handle(context)
  }
}
