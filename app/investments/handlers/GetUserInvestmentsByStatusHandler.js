const BaseHandler = require("@/core/BaseHandler")
const investmentsModel = require("@/models/Investments")
const investmentAccrualsModel = require("@/models/InvestmentAccrualsModel")

module.exports = class GetUserInvestmentsByStatusHandler extends BaseHandler {
  constructor() {
    super()
    this.model = investmentsModel
    this.accrualsModel = investmentAccrualsModel
  }

  async handle(context) {
    const { errors, settings, userId } = context
    if (errors.length > 0) return context
    try {
      const posts = await this.model.getUserPostsByStatus(userId, settings)

      if (posts && posts.length > 0) {
        const investmentIds = posts.map((post) => post.id)

        const accruals =
          await this.accrualsModel.getTotalAccruedByInvestmentIds(investmentIds)

        const accrualsMap = new Map()
        accruals.forEach((accrual) => {
          accrualsMap.set(
            accrual.investment_id,
            parseFloat(accrual.total_accrued) || 0
          )
        })

        posts.forEach((post) => {
          post.total_accrued = accrualsMap.get(post.id) || 0
        })
      }

      context.body.posts = posts
    } catch (err) {
      errors.push(`Ошибка при работе с базой: ${err.message}`)
      return context
    }

    return super.handle(context)
  }
}
