const BaseHandler = require("@/core/BaseHandler")
const knex = require("@/db")

module.exports = class CreateInvestmentHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    const { user_id, amount_usd } = body

    if (!user_id || amount_usd == null) {
      errors.push("Не указан user_id или сумма для списания")
      return context
    }

    const allowedFields = [
      "user_id",
      "amount_usd",
      "status",
      "strategy_type",
      "preset_type",
      "custom_preset_id",
      "created_at",
      "activated_at",
      "closed_at"
    ]

    const insertData = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        insertData[field] = body[field]
      }
    }

    const now = knex.fn.now()
    if (!insertData.created_at) insertData.created_at = now
    if (!insertData.activated_at)
      insertData.activated_at = insertData.created_at

    try {
      await knex.transaction(async (trx) => {
        const updated = await trx("users_balance")
          .where({ user_id, currency: "USDT" })
          .andWhere("balance", ">=", amount_usd)
          .update({
            balance: trx.raw("balance - ?", [amount_usd]),
            updated_at: trx.fn.now()
          })

        if (!updated) {
          throw new Error("Недостаточно средств при списании")
        }

        const [investmentId] = await trx("investments").insert(insertData)
        context.insertId = investmentId

        const logData = {
          user_id,
          currency: "USDT",
          operation: "withdraw",
          amount: amount_usd,
          change_source: "self",
          changed_by_admin_id: null,
          changed_by_user_id: user_id,
          comment: `Покупка инвестиции #${investmentId} — списание ${amount_usd} USDT (стратегия: ${insertData.strategy_type || "не указана"})`
        }

        await trx("balance_changes").insert(logData)
      })
    } catch (err) {
      errors.push("Ошибка создания инвестиции: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
