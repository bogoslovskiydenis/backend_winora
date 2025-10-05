const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class GetPostsHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      context.body = await sharesModel.getPosts(data.settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
