const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class GetTotalPostsHandler extends BaseHandler {
  async handle(context) {
    const { errors } = context
    if (errors.length > 0) return context
    try {
      context.total = await sharesModel.getTotalCount()
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
