const BaseHandler = require("@/core/BaseHandler")
const knex = require("@/db")

/**
 * Хендлер завершения инвестиции:
 * - проверяет, что инвестиция активна
 * - переводит статус в closed
 * - возвращает сумму на депозит пользователя
 * - всё в одной транзакции
 */
module.exports = class CompleteInvestmentHandler extends BaseHandler {
  async handle(context) {
    const { userId, investmentId, errors } = context

    if (!userId || !investmentId) {
      errors.push("Не указан пользователь или инвестиция")
      return context
    }

    try {
      await knex.transaction(async (trx) => {
        const investment = await trx("investments")
          .where({ id: investmentId, user_id: userId })
          .first()

        if (!investment) errors.push("Инвестиция не найдена")
        if (investment.status !== "active") errors.push("Инвестиция не активна")
        const amount = Number(investment.amount_usd)
        const updated = await trx("investments")
          .where({ id: investmentId })
          .update({
            status: "closed",
            closed_at: trx.fn.now()
          })

        if (!updated) {
          errors.push("Не удалось обновить статус инвестиции")
        }

        const updatedBalance = await trx("users_balance")
          .where({ user_id: userId, currency: "USDT" })
          .update({
            balance: knex.raw("balance + ?", [amount]),
            updated_at: trx.fn.now()
          })

        if (!updatedBalance) {
          errors.push("Не удалось вернуть средства пользователю")
        }
      })
    } catch (err) {
      errors.push("Ошибка завершения инвестиции: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
