const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")

module.exports = class InsertDepositTransactionHandler extends BaseHandler {
  constructor() {
    super()
    this.model = transactionModel
  }
  async handle(context) {
    const { errors, prepareData } = context
    if (errors.length > 0) return context
    try {
      const { id } = await this.model.store(prepareData)
      context.insertId = id
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
