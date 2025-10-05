const BaseHandler = require("@/core/BaseHandler.js")
const sharesModel = require("@/models/Shares")

module.exports = class StorePostHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    if (errors.length > 0) return context
    try {
      const preparatoryData = {
        title: data.title,
        subTitle: data.subTitle,
        image: data.image,
        depositAmount: data.depositAmount,
        order: data.order,
        status: data.status
      }
      context.insertId = await sharesModel.insert(preparatoryData)
    } catch (err) {
      errors.push(`Ошибка при сохранении в базу: ${err.message}`)
      return context
    }
    return super.handle(context)
  }
}
