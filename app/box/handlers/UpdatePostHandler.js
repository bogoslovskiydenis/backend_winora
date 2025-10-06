const BaseHandler = require("@/core/BaseHandler")
const postModel = require("@/models/Boxes")
const { requiredFields } = require("@/app/box/config")

module.exports = class UpdatePostHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      if (!data.id) {
        errors.push(`Поле "id" обязательно для обновления записи`)
        return context
      }
      const preparatoryData = {}
      for (const field of requiredFields) {
        if (data[field] !== undefined) {
          preparatoryData[field] = data[field]
        }
      }
      await postModel.updateById(data.id, preparatoryData)
    } catch (err) {
      errors.push(`Ошибка при обновлении записи: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
