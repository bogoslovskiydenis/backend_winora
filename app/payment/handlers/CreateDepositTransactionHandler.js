const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")

module.exports = class CreateDepositTransactionHandler extends BaseHandler {
  async handle(context) {
    const { userId, amount, errors } = context

    if (errors.length > 0) return context
    try {
      context.insertId = await transactionModel.store({
        user_id: userId,
        amount,
        type: "deposit",
        status: "pending"
      })
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    if (errors.length > 0) return context
    return super.handle(context)
  }
}
