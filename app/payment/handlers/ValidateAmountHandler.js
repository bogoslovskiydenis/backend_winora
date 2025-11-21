const BaseHandler = require("@/core/BaseHandler")

module.exports = class ValidateAmountHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { amount } = body
    const numericAmount = Number(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.push("Некорректная сумма пополнения")
      return context
    }

    if (numericAmount > 1_000_000) {
      errors.push("Слишком большая сумма пополнения")
      return context
    }
    context.body.amount = numericAmount

    return super.handle(context)
  }
}
