const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")
const {
  generateMockTransaction
} = require("@/app/payment/mocks/transactionMock")

module.exports = class ProcessPaymentHandler extends BaseHandler {
  async handle(context) {
    const { userId, amount, errors } = context
    if (errors.length > 0) return context

    try {
      const mockData = generateMockTransaction(userId, amount)
      const post = await transactionModel.store(mockData)
      context.insertId = post.id
    } catch (err) {
      errors.push("Ошибка при создании транзакции: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
