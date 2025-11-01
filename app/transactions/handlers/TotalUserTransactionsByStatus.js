const BaseHandler = require("@/core/BaseHandler")
const transactionsModel = require("@/models/Transactions")

module.exports = class TotalUserTransactionsByStatuses extends BaseHandler {
  constructor() {
    super()
    this.model = transactionsModel
  }

  async handle(context) {
    const { errors, settings, userId } = context
    if (errors.length > 0) return context

    if (!userId) {
      errors.push("Не указан идентификатор пользователя")
      return context
    }

    if (!Array.isArray(statuses) || statuses.length === 0) {
      errors.push("Параметр 'statuses' должен быть непустым массивом")
      return context
    }

    try {
      context.body.total = await this.model.totalPostsUserByStatuses(
        userId,
        settings
      )
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
