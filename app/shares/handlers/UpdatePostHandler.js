const BaseHandler = require("@/core/BaseHandler")
const postModel = require("@/models/Shares")
const { requiredFields } = require("@/app/shares/config")

module.exports = class UpdatePostHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    try {
      if (!body.id) {
        errors.push(`Поле "id" обязательно для обновления записи`)
        return context
      }
      const preparatoryData = {}
      for (const field of requiredFields) {
        if (body[field] !== undefined) {
          preparatoryData[field] = body[field]
        }
      }
      await postModel.updateById(body.id, preparatoryData)
    } catch (err) {
      errors.push(`Ошибка при обновлении записи: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
