const BaseHandler = require("@/core/BaseHandler")
const { requiredFields, fieldTypes, constraints } = require("@/app/box/config")

module.exports = class ValidatePostStructureHandler extends BaseHandler {
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

    if (typeof body.title === "string") {
      if (
        body.title.length < constraints.title.min ||
        body.title.length > constraints.title.max
      ) {
        errors.push(
          `Поле "title" должно быть от ${constraints.title.min} до ${constraints.title.max} символов`
        )
      }
    }

    if (
      typeof body.subTitle === "string" &&
      body.subTitle.length > constraints.subTitle.max
    ) {
      errors.push(
        `Поле "subTitle" не может быть длиннее ${constraints.subTitle.max} символов`
      )
    }

    if (
      typeof body.image === "string" &&
      body.image.length > constraints.image.max
    ) {
      errors.push(
        `Поле "image" не может быть длиннее ${constraints.image.max} символов`
      )
    }

    if (
      typeof body.status === "string" &&
      !constraints.status.includes(body.status)
    ) {
      errors.push(`Недопустимое значение поля "status"`)
    }

    if (typeof body.depositAmount === "number" && body.depositAmount < 0) {
      errors.push(`Поле "depositAmount" не может быть отрицательным`)
    }

    if (typeof body.order === "number" && body.order < 0) {
      errors.push(`Поле "order" должно быть положительным числом`)
    }

    if (errors.length > 0) return context

    return super.handle(context)
  }
}
