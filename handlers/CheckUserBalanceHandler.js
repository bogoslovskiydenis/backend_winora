const BaseHandler = require("@/core/BaseHandler")
const userBalance = require("@/models/UserBalance")

/**
 * Хендлер для проверки достаточности средств на счёте пользователя
 *
 * Вход в context.body:
 *  - user_id
 *  - amount_usd
 *
 * Результат:
 *  - context.errors[] — ошибки, если средств недостаточно
 */
module.exports = class CheckUserBalanceHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { user_id, amount_usd } = body

    if (!user_id || amount_usd == null) {
      errors.push("Не указан user_id или сумма для проверки")
      return context
    }

    try {
      const data = await userBalance.findByUserId(user_id)
      if (!data) {
        errors.push("Баланс пользователя не найден")
      } else if (Number(data.balance) < Number(amount_usd)) {
        errors.push("Недостаточно средств на счёте")
      }
    } catch (err) {
      errors.push("Ошибка проверки баланса: " + err.message)
    }

    return super.handle(context)
  }
}
