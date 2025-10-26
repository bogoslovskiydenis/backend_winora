const BaseHandler = require("@/core/BaseHandler")

module.exports = class UpdateByIdHandler extends BaseHandler {
  constructor(model) {
    super()
    if (!model) {
      throw new Error("Model instance is required for UpdateByIdHandler")
    }
    this.model = model
  }

  async handle(context) {
    const { prepareData, errors } = context

    if (errors.length > 0) return context

    if (!prepareData || typeof prepareData !== "object") {
      errors.push("Нет данных для обновления (prepareData пуст)")
      return context
    }

    const { id, ...updateData } = prepareData
    if (!id) {
      errors.push("Не указан идентификатор записи (id)")
      return context
    }

    try {
      await this.model.updateById(id, updateData)
    } catch (err) {
      errors.push(`Ошибка при обновлении записи: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
