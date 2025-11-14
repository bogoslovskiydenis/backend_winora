const BaseHandler = require("@/core/BaseHandler")
const investmentAccrualsModel = require("@/models/InvestmentAccrualsModel")

class InsertAccrualsHandler extends BaseHandler {
  constructor() {
    super()
    this.model = investmentAccrualsModel
  }

  async handle(context) {
    const { errors, body } = context
    if (errors.length > 0) return context
    const { accruals } = body
    if (!Array.isArray(accruals)) errors.push("Ошибка поля accruals")
    await this.model.insertMany(accruals)
    return super.handle(context)
  }
}

module.exports = InsertAccrualsHandler
