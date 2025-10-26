const BaseHandler = require("@/core/BaseHandler")
const postModel = require("@/models/Shares")
const { requiredFields } = require("@/app/shares/config")

module.exports = class StorePostHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    try {
      const preparatoryData = {}
      for (const field of requiredFields) {
        preparatoryData[field] = body[field]
      }
      context.insertId = await postModel.insert(preparatoryData)
    } catch (err) {
      errors.push(`Ошибка при сохранении в базу: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
