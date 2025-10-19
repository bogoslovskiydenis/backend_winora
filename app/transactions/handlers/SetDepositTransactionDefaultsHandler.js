const BaseHandler = require("@/core/BaseHandler")

module.exports = class SetDepositTransactionDefaultsHandler extends (
  BaseHandler
) {
  async handle(context) {
    const { body = {}, errors } = context
    if (errors.length > 0) return context
    body.type = "deposit"
    body.status = "pending"
    body.fee = body.fee ?? 0
    body.is_manual = false
    body.tx_hash = null
    const optionalFields = [
      "from_address",
      "to_address",
      "explorer_url",
      "internal_comment",
      "user_comment"
    ]
    for (const field of optionalFields) body[field] = ""
    return super.handle(context)
  }
}
