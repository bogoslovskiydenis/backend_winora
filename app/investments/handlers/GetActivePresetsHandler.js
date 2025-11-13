const BaseHandler = require("@/core/BaseHandler")
const presetsModel = require("@/models/Presets")

module.exports = class GetActivePresetsHandler extends BaseHandler {
  constructor() {
    super()
    this.model = presetsModel
  }

  async handle(context) {
    const { errors, settings } = context
    if (errors.length > 0) return context
    try {
      context.body.posts = await this.model.getPublicPosts(settings)
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
