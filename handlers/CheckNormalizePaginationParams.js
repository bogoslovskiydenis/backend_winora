const BaseHandler = require("@/core/BaseHandler")

module.exports = class CheckNormalizePaginationParams extends BaseHandler {
  async handle(context) {
    const { settings = {}, errors = [] } = context
    let { limit, offset } = settings
    if (errors.length) return context
    if (limit !== undefined) {
      const parsedLimit = parseInt(limit, 10)
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        errors.push("Параметр 'limit' должен быть положительным числом")
      } else if (parsedLimit > 100) {
        errors.push("Параметр 'limit' не может превышать 100")
      } else {
        settings.limit = parsedLimit
      }
    } else {
      settings.limit = 8
    }
    if (offset !== undefined) {
      const parsedOffset = parseInt(offset, 10)
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        errors.push("Параметр 'offset' должен быть неотрицательным числом")
      } else {
        settings.offset = parsedOffset
      }
    } else {
      settings.offset = 0
    }
    if (errors.length > 0) return context
    return super.handle(context)
  }
}
