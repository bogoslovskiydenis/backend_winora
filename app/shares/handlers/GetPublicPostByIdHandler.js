const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class GetPublicPostByIdHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      const post = await sharesModel.getPublicPostById(data.id)
      if (post) {
        context.body = post
      } else {
        errors.push("Пост с таким id не существует")
      }
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
