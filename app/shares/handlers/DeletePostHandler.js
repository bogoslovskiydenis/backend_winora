const BaseHandler = require("@/core/BaseHandler.js")
const postModel = require("@/models/Shares")

module.exports = class DeletePostHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    try {
      await postModel.deleteById(body.id)
    } catch (err) {
      errors.push(`Ошибка при удалении из базу: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
