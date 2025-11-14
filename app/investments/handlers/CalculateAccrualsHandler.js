const BaseHandler = require("@/core/BaseHandler")
class CalculateAccrualsHandler extends BaseHandler {
  constructor() {
    super()
  }

  async handle(context) {
    const { errors, body } = context
    const { investments, presets } = body

    if (errors.length > 0) return context

    if (!investments || !Array.isArray(investments))
      errors.push("Проблемы с ключем investments")
    if (!presets || !Array.isArray(presets))
      errors.push("Проблемы с ключем presets")
    const presetConfig = {}
    presets.forEach(({ slug, profit_percent }) => {
      presetConfig[slug] = profit_percent
    })
    const accruals = []
    investments.forEach(({ id, amount_usd, preset_type }) => {
      accruals.push({
        investment_id: id,
        amount_usd: (amount_usd * (presetConfig[preset_type] / 100)) / 30
      })
    })
    body.accruals = accruals
    if (errors.length > 0) return context

    return super.handle(context)
  }
}

module.exports = CalculateAccrualsHandler
