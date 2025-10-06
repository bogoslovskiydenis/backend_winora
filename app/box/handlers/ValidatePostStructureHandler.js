const BaseHandler = require("@/core/BaseHandler")
const { requiredFields, fieldTypes, constraints } = require("@/app/box/config")

module.exports = class ValidatePostStructureHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context

    for (const field of requiredFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        errors.push(`Поле "${field}" обязательно для заполнения`)
      }
    }

    for (const [field, type] of Object.entries(fieldTypes)) {
      if (data[field] !== undefined && typeof data[field] !== type) {
        errors.push(`Поле "${field}" должно быть типа ${type}`)
      }
    }

    if (typeof data.title === "string") {
      if (
        data.title.length < constraints.title.min ||
        data.title.length > constraints.title.max
      ) {
        errors.push(
          `Поле "title" должно быть от ${constraints.title.min} до ${constraints.title.max} символов`
        )
      }
    }

    if (
      typeof data.subTitle === "string" &&
      data.subTitle.length > constraints.subTitle.max
    ) {
      errors.push(
        `Поле "subTitle" не может быть длиннее ${constraints.subTitle.max} символов`
      )
    }

    if (
      typeof data.image === "string" &&
      data.image.length > constraints.image.max
    ) {
      errors.push(
        `Поле "image" не может быть длиннее ${constraints.image.max} символов`
      )
    }

    if (
      typeof data.status === "string" &&
      !constraints.status.includes(data.status)
    ) {
      errors.push(`Недопустимое значение поля "status"`)
    }

    if (typeof data.depositAmount === "number" && data.depositAmount < 0) {
      errors.push(`Поле "depositAmount" не может быть отрицательным`)
    }

    if (typeof data.order === "number" && data.order < 0) {
      errors.push(`Поле "order" должно быть положительным числом`)
    }

    if (errors.length > 0) return context

    return super.handle(context)
  }
}
