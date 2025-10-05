const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class DeletePostHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      await sharesModel.deleteById(data.id)
    } catch (err) {
      errors.push(`Ошибка при удалении из базу: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
