const BaseHandler = require("@/core/BaseHandler")
const knex = require("@/db")

module.exports = class ExecuteBalanceOperationHandler extends BaseHandler {
  async handle(context) {
    const { errors, body = {} } = context
    if (errors.length > 0) return context

    const { operation, user_id, amount, currency, editorId, comment } = body
    try {
      await knex.transaction(async (trx) => {
        let updated = 0

        if (operation === "deposit") {
          updated = await trx("users_balance")
            .where({ user_id, currency })
            .update({
              balance: trx.raw("balance + ?", [amount]),
              updated_at: trx.fn.now()
            })

          if (!updated) {
            await trx("users_balance").insert({
              user_id,
              currency,
              balance: amount,
              locked_balance: 0,
              created_at: trx.fn.now(),
              updated_at: trx.fn.now()
            })
          }
        } else if (operation === "withdraw") {
          updated = await trx("users_balance")
            .where({ user_id, currency })
            .andWhere("balance", ">=", amount)
            .update({
              balance: trx.raw("balance - ?", [amount]),
              updated_at: trx.fn.now()
            })

          if (!updated) {
            throw new Error("Не удалось списать средства")
          }
        } else if (operation === "freeze") {
          updated = await trx("users_balance")
            .where({ user_id, currency })
            .andWhere("balance", ">=", amount)
            .update({
              balance: trx.raw("balance - ?", [amount]),
              locked_balance: trx.raw("locked_balance + ?", [amount]),
              updated_at: trx.fn.now()
            })

          if (!updated) {
            throw new Error("Не удалось заморозить средства")
          }
        } else if (operation === "unfreeze") {
          updated = await trx("users_balance")
            .where({ user_id, currency })
            .andWhere("locked_balance", ">=", amount)
            .update({
              balance: trx.raw("balance + ?", [amount]),
              locked_balance: trx.raw("locked_balance - ?", [amount]),
              updated_at: trx.fn.now()
            })

          if (!updated) {
            throw new Error("Не удалось разморозить средства")
          }
        } else {
          throw new Error("Неизвестная операция с балансом")
        }

        const logData = {
          user_id,
          currency,
          operation,
          amount,
          change_source: editorId ? "admin" : "self",
          changed_by_admin_id: editorId || null,
          changed_by_user_id: editorId ? null : user_id,
          comment
        }

        await trx("balance_changes").insert(logData)
      })
    } catch (err) {
      errors.push("Ошибка операции с балансом: " + err.message)
      return context
    }

    return super.handle(context)
  }
}
