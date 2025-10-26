const BaseHandler = require("@/core/BaseHandler.js")

module.exports = class DeleteByIdHandler extends BaseHandler {
  constructor(model) {
    super()
    if (!model) {
      throw new Error("Model instance is required for DeleteByIdHandler")
    }
    this.model = model
  }

  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context

    const { id } = body

    if (!id) {
      errors.push("Не указан идентификатор записи (id)")
      return context
    }

    try {
      await this.model.deleteById(id)
    } catch (err) {
      errors.push(`Ошибка при удалении из базы: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
