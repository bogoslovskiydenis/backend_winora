const BaseHandler = require("@/core/BaseHandler")

module.exports = class TransactionCommentInvestmentHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { user_id, amount_usd, investmentId, strategy_type, operation } = body

    if (!user_id || amount_usd == null || !investmentId) {
      errors.push("Недостаточно данных для генерации комментария по инвестиции")
      return context
    }

    let comment

    switch (operation) {
      case "purchase":
        comment = `Покупка инвестиции #${investmentId}, стратегия: ${strategy_type || "не указана"}, сумма: ${amount_usd} USD`
        break
      case "return":
        comment = `Возврат по инвестиции #${investmentId}, стратегия: ${strategy_type || "не указана"}, сумма: ${amount_usd} USD`
        break
      default:
        comment = `Операция по инвестиции #${investmentId}, сумма: ${amount_usd} USD`
        break
    }

    context.body.comment = comment

    return super.handle(context)
  }
}
