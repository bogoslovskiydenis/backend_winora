const BaseHandler = require("@/core/BaseHandler")

module.exports = class PrepareDataHandler extends BaseHandler {
  constructor(allowedFields = []) {
    super()
    this.allowedFields = allowedFields
  }

  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context

    const prepareData = {}

    for (const field of this.allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        prepareData[field] = body[field]
      }
    }

    context.prepareData = prepareData
    return super.handle(context)
  }
}
