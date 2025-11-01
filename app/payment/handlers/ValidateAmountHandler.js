const BaseHandler = require("@/core/BaseHandler")

module.exports = class ValidateAmountHandler extends BaseHandler {
  async handle(context) {
    let { amount, errors } = context
    const numericAmount = Number(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.push("Некорректная сумма пополнения")
      return context
    }

    if (numericAmount > 1_000_000) {
      errors.push("Слишком большая сумма пополнения")
      return context
    }
    context.amount = numericAmount

    return super.handle(context)
  }
}
