const BaseHandler = require("@/core/BaseHandler")

module.exports = class RenameFieldsHandler extends BaseHandler {
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
    this.fieldList.forEach(([oldName, newName]) => {
      body[newName] = body[oldName]
      delete body[oldName]
    })
    return super.handle(context)
  }
}
