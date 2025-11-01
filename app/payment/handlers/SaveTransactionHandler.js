const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")

module.exports = class SaveTransactionHandler extends BaseHandler {
  async handle(context) {
    const { errors, insertId } = context
    if (errors.length > 0) return context

    try {
      if (!insertId) {
        errors.push("Отсутствует идентификатор транзакции для сохранения")
        return context
      }
      console.log(insertId, "Transaction Id")
      await transactionModel.updateById(insertId, {
        status: "confirmed",
        confirmed_at: new Date(),
        internal_comment: "Mock payment confirmed"
      })
    } catch (err) {
      errors.push(`Ошибка при сохранении транзакции: ${err.message}`)
    }

    return super.handle(context)
  }
}
