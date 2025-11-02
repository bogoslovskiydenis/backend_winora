const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")

module.exports = class CreateDepositTransactionHandler extends BaseHandler {
  async handle(context) {
    const { userId, amount, errors, currency } = context

    if (errors.length > 0) return context
    try {
      const { id } = await transactionModel.store({
        user_id: userId,
        amount,
        currency,
        type: "deposit",
        status: "pending"
      })
      context.insertId = id
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    if (errors.length > 0) return context
    return super.handle(context)
  }
}
