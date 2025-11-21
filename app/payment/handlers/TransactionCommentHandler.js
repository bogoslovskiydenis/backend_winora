const BaseHandler = require("@/core/BaseHandler")

module.exports = class TransactionCommentHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { user_id, amount, currency } = body

    if (!user_id || amount == null || !currency) {
      errors.push("Недостаточно данных для генерации комментария")
      return context
    }

    context.body.comment = `Пополнение баланса при помощи транзакции ${amount} ${currency}`

    return super.handle(context)
  }
}
