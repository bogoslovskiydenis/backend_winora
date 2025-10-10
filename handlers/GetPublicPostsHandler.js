const BaseHandler = require("@/core/BaseHandler")

module.exports = class GetPostsHandler extends BaseHandler {
  constructor(model, settings = {}, key = "posts") {
    super()
    this.model = model
    this.settings = settings
    this.key = key
  }

  async handle(context) {
    const { errors } = context
    if (errors.length > 0) return context
    try {
      context.body[this.key] = await this.model.getPublicPosts(this.settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
