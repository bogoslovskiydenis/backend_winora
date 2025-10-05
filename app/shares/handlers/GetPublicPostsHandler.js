const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class GetPublicPostsHandler extends BaseHandler {
  async handle(context) {
    const { settings, errors } = context
    if (errors.length > 0) return context
    try {
      context.body = await sharesModel.getPublicPosts(settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
