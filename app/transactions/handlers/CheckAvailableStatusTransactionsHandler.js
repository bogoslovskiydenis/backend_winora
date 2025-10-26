const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckAvailableStatusTransactionsHandler extends (
  BaseHandler
) {
  constructor(allowedStatuses = []) {
    super()
    this.allowedStatuses = allowedStatuses
  }

  async handle(context) {
    const { settings, errors } = context
    const { statuses } = settings
    if (!Array.isArray(statuses)) {
      errors.push("Поле 'statuses' должно быть массивом")
      return context
    }
    const invalidStatuses = statuses.filter(
      (status) => !this.allowedStatuses.includes(status)
    )
    if (invalidStatuses.length > 0) {
      errors.push(`Невалидные статусы: ${invalidStatuses.join(", ")}`)
      return context
    }
    return super.handle(context)
  }
}
