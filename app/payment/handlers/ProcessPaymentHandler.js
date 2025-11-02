const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")
const {
  generateMockTransaction
} = require("@/app/payment/mocks/transactionMock")

module.exports = class ProcessPaymentHandler extends BaseHandler {
  async handle(context) {
    const { userId, amount, insertId, errors } = context
    if (errors.length > 0) return context

    try {
      const existingTx = await transactionModel.getPostById(insertId)
      if (!existingTx) {
        errors.push(`Транзакция #${insertId} не найдена`)
        return context
      }

      const mockData = generateMockTransaction(userId, amount)

      const safeUpdate = {
        status: mockData.status || "processing",
        fee: mockData.fee,
        network: mockData.network,
        tx_hash: mockData.tx_hash,
        explorer_url: mockData.explorer_url,
        internal_comment: "Mock transaction processed",
        meta: mockData.meta
      }
      await transactionModel.updateById(insertId, safeUpdate)
    } catch (err) {
      errors.push("Ошибка при обработке транзакции: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
