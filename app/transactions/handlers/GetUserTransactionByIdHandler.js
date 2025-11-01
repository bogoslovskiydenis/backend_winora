const BaseHandler = require("@/core/BaseHandler")
const transactionsModel = require("@/models/Transactions")

module.exports = class GetUserTransactionByIdHandler extends BaseHandler {
  constructor() {
    super()
    this.model = transactionsModel
  }

  async handle(context) {
    const { errors, body, userId } = context
    if (errors.length > 0) return context
    try {
      const { transactionId } = body
      const candidate = await this.model.getPostByUserIdTransactionId(
        userId,
        transactionId
      )
      if (candidate) context.body = candidate
      else errors.push(`Транзакция с таким Id ${transactionId} не найдена`)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    if (errors.length > 0) return context
    return super.handle(context)
  }
}
