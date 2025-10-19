// handlers/TrimTransactionFieldsHandler.js
const BaseHandler = require("@/core/BaseHandler")

module.exports = class TrimTransactionFieldsHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    const fieldsToTrim = [
      "currency",
      "network",
      "from_address",
      "to_address",
      "explorer_url",
      "internal_comment",
      "user_comment"
    ]
    for (const field of fieldsToTrim) {
      if (typeof body[field] === "string") body[field] = body[field].trim()
    }
    return super.handle(context)
  }
}
