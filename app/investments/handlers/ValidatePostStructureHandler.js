const BaseHandler = require("@/core/BaseHandler")
const {
  requiredFields,
  fieldTypes,
  constraints
} = require("@/app/investments/config")

module.exports = class ValidateInvestmentStructureHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        errors.push(`Поле "${field}" обязательно для заполнения`)
      }
    }

    for (const [field, type] of Object.entries(fieldTypes)) {
      if (body[field] !== undefined && typeof body[field] !== type) {
        errors.push(`Поле "${field}" должно быть типа ${type}`)
      }
    }

    if (
      typeof body.amount_usd === "number" &&
      body.amount_usd < constraints.amount_usd.min
    ) {
      errors.push(
        `Поле "amount_usd" не может быть меньше ${constraints.amount_usd.min}`
      )
    }

    if (
      typeof body.status === "string" &&
      !constraints.status.includes(body.status)
    ) {
      errors.push(`Недопустимое значение поля "status"`)
    }

    if (
      typeof body.strategy_type === "string" &&
      !constraints.strategy_type.includes(body.strategy_type)
    ) {
      errors.push(`Недопустимое значение поля "strategy_type"`)
    }

    if (errors.length > 0) return context

    return super.handle(context)
  }
}
