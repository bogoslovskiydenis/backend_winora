const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckAvailableTypeTransactionsHandler extends (
  BaseHandler
) {
  constructor(allowedTypes = []) {
    super()
    this.allowedType = allowedTypes
  }

  async handle(context) {
    const { settings, errors } = context
    const { types } = settings
    if (!Array.isArray(types)) {
      errors.push("Поле 'types' должно быть массивом")
      return context
    }
    const invalidTypes = types.filter(
      (type) => !this.allowedType.includes(type)
    )
    if (invalidTypes.length > 0) {
      errors.push(`Невалидные типы: ${invalidTypes.join(", ")}`)
      return context
    }
    return super.handle(context)
  }
}
