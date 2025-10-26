const BaseHandler = require("@/core/BaseHandler")

module.exports = class GetPostByIdHandler extends BaseHandler {
  constructor(model) {
    super()
    this.model = model
  }
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      const post = await this.model.getPostById(data.id)
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
