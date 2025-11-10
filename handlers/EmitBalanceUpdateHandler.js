const BaseHandler = require("@/core/BaseHandler")
const { socketFrontBalanceUpdate } = require("@/sockets/front")
const userBalance = require("@/models/UserBalance")

/**
 * Хендлер для уведомления фронта об изменении баланса
 * Берёт актуальный баланс из базы, учитывая валюту
 *
 * Вход в context.body:
 *  - user_id (ID пользователя)
 *  - currency (опционально, по умолчанию "USDT")
 *  - type (опционально, например "investment", "withdrawal")
 */
module.exports = class EmitBalanceUpdateHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { user_id, currency = "USDT" } = body

    if (!user_id) {
      errors.push("Не указан user_id для уведомления баланса")
      return context
    }

    try {
      const balanceData = await userBalance.findByUserId(user_id, currency)

      if (!balanceData) {
        errors.push(
          `Баланс пользователя с ID ${user_id} и валютой ${currency} не найден`
        )
        return context
      }

      socketFrontBalanceUpdate([user_id], {
        balance: Number(balanceData.balance),
        currency: balanceData.currency || currency,
        status: "ok"
      })
    } catch (err) {
      errors.push(`Ошибка при отправке уведомления через сокет: ${err.message}`)
    }

    return super.handle(context)
  }
}
