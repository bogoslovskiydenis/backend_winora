const BaseHandler = require("@/core/BaseHandler")

module.exports = class RemoveFieldsHandler extends BaseHandler {
  constructor(fieldList) {
    super()
    this.fieldList = Array.isArray(fieldList) ? fieldList : []
  }

  async handle(context) {
    const { errors, body } = context
    if (errors.length > 0) {
      return context
    }
    if (!body || typeof body !== "object") {
      errors.push("Некорректные данные body: ожидается объект")
      return context
    }
    if (this.fieldList.length === 0) {
      errors.push("Список полей для удаления пустой")
      return context
    }
    for (const field of this.fieldList) {
      if (field in body) {
        delete body[field]
      }
    }
    return super.handle(context)
  }
}
