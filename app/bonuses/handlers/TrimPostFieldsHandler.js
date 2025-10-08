const BaseHandler = require("@/core/BaseHandler")

module.exports = class TrimPostFieldsHandler extends BaseHandler {
  async handle(context) {
    const fieldsToTrim = ["title", "subTitle", "image"]
    for (const field of fieldsToTrim) {
      if (typeof context.data[field] === "string") {
        context.data[field] = context.data[field].trim()
      }
    }
    return super.handle(context)
  }
}
