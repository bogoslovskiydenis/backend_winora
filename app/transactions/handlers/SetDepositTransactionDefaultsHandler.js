const BaseHandler = require("@/core/BaseHandler")

module.exports = class SetDepositTransactionDefaultsHandler extends BaseHandler {
  async handle(context) {
    const { body = {}, errors } = context
    if (errors.length > 0) return context

    // Устанавливаем дефолты только для полей которых НЕТ
    body.type = "deposit"
    body.status = "pending"
    body.is_manual = false
    body.tx_hash = null

    // Устанавливаем дефолты ТОЛЬКО если поля отсутствуют или undefined
    if (body.fee === undefined || body.fee === null) {
      body.fee = 0
    }

    if (body.from_address === undefined) {
      body.from_address = ""
    }

    if (body.to_address === undefined) {
      body.to_address = ""
    }

    if (body.explorer_url === undefined) {
      body.explorer_url = ""
    }

    if (body.internal_comment === undefined) {
      body.internal_comment = ""
    }

    if (body.user_comment === undefined) {
      body.user_comment = ""
    }

    return super.handle(context)
  }
}