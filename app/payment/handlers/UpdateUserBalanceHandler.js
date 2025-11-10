const BaseHandler = require("@/core/BaseHandler")
const userBalanceModel = require("@/models/UserBalance")
const transactionModel = require("@/models/Transactions")
const { socketFrontBalanceUpdate } = require("@/sockets/front")

module.exports = class UpdateUserBalanceHandler extends BaseHandler {
  constructor(defaultCurrency = "USDT") {
    super()
    this.currency = defaultCurrency
  }

  async handle(context) {
    const { userId, insertId, errors } = context
    if (errors.length > 0) return context

    try {
      const transaction = await transactionModel.getPostById(insertId)
      if (!transaction) {
        errors.push(`Транзакция #${insertId} не найдена`)
        return context
      }

      const { type, amount, currency } = transaction
      const effectiveCurrency = currency || this.currency

      const userBalance = await userBalanceModel.findByUserId(
        userId,
        effectiveCurrency
      )

      if (!userBalance) {
        errors.push(
          `Баланс пользователя ${userId} для валюты ${effectiveCurrency} не найден`
        )
        return context
      }

      const sign = type === "withdrawal" ? -1 : 1
      const newBalance = Number(userBalance.balance) + sign * Number(amount)

      if (newBalance < 0) {
        errors.push(`Недостаточно средств для операции ${type}`)

        await transactionModel.update(insertId, {
          status: "failed",
          internal_comment: "Недостаточно средств для списания"
        })

        socketFrontBalanceUpdate([userId], {
          balance: userBalance.balance,
          currency: effectiveCurrency,
          status: "failed"
        })

        return context
      }

      await userBalanceModel.updateByUserId(
        userId,
        { balance: newBalance },
        effectiveCurrency
      )

      socketFrontBalanceUpdate([userId], {
        balance: newBalance,
        currency: effectiveCurrency,
        type,
        status: "ok"
      })
    } catch (err) {
      errors.push("Ошибка при обновлении баланса: " + err.message)
      if (insertId) {
        await transactionModel.update(insertId, {
          status: "failed",
          internal_comment: "Ошибка при обновлении баланса"
        })
      }

      return context
    }

    return super.handle(context)
  }
}
