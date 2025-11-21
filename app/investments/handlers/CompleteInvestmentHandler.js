const BaseHandler = require("@/core/BaseHandler")
const knex = require("@/db")

module.exports = class CompleteInvestmentHandler extends BaseHandler {
  async handle(context) {
    const { investmentId, errors, body } = context
    const { user_id } = body

    if (!user_id || !investmentId) {
      errors.push("Не указан пользователь или инвестиция")
      return context
    }

    try {
      await knex.transaction(async (trx) => {
        const investment = await trx("investments")
          .where({ id: investmentId, user_id })
          .first()

        if (!investment) throw new Error("Инвестиция не найдена")
        if (investment.status !== "active")
          throw new Error("Инвестиция не активна")

        const baseAmount = Number(investment.amount_usd)

        const accrualResult = await trx("investment_accruals")
          .where({ investment_id: investmentId })
          .sum({ total: "amount_usd" })
          .first()

        const accrualTotal = Number(accrualResult.total || 0)

        const returnAmount = baseAmount + accrualTotal

        const updated = await trx("investments")
          .where({ id: investmentId })
          .update({
            status: "closed",
            closed_at: trx.fn.now()
          })

        if (!updated) throw new Error("Не удалось обновить статус инвестиции")

        const updatedBalance = await trx("users_balance")
          .where({ user_id, currency: "USDT" })
          .update({
            balance: trx.raw("balance + ?", [returnAmount]),
            updated_at: trx.fn.now()
          })

        if (!updatedBalance)
          throw new Error("Не удалось вернуть средства пользователю")

        const logData = {
          user_id,
          currency: "USDT",
          operation: "deposit",
          amount: returnAmount,
          change_source: "self",
          changed_by_admin_id: null,
          changed_by_user_id: user_id,
          comment:
            `Завершение инвестиции #${investmentId} — возврат ${returnAmount} USDT ` +
            `(вложено: ${baseAmount}, доход: ${accrualTotal}, стратегия: ${investment.strategy_type || "не указана"})`
        }

        await trx("balance_changes").insert(logData)
      })
    } catch (err) {
      errors.push("Ошибка завершения инвестиции: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
