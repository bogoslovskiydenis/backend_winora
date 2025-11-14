const BaseHandler = require("@/core/BaseHandler")

module.exports = class WrapperPresetsHandler extends BaseHandler {
  async handle(context) {
    const { body = [], errors } = context

    body.posts = body.presets.map(({ id, slug, name, profit_percent }) => ({
      id,
      slug,
      name,
      profit_percent
    }))
    if (errors.length > 0) {
      return context
    }
    return super.handle(context)
  }
}
