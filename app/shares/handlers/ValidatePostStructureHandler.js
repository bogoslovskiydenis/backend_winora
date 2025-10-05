const BaseHandler = require("@/core/BaseHandler.js")

module.exports = class ValidatePostStructureHandler extends BaseHandler {
  async handle(context) {
    const { data, errors } = context
    const requiredFields = [
      "title",
      "subTitle",
      "image",
      "depositAmount",
      "order",
      "status"
    ]
    for (const field of requiredFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        errors.push(`Поле "${field}" обязательно для заполнения`)
      }
    }
    if (data.title && typeof data.title !== "string") {
      errors.push(`Поле "title" должно быть строкой`)
    }

    if (data.subTitle && typeof data.subTitle !== "string") {
      errors.push(`Поле "subTitle" должно быть строкой`)
    }

    if (data.image && typeof data.image !== "string") {
      errors.push(`Поле "image" должно быть строкой`)
    }

    if (
      data.depositAmount !== undefined &&
      typeof data.depositAmount !== "number"
    ) {
      errors.push(`Поле "depositAmount" должно быть числом`)
    }

    if (data.order !== undefined && typeof data.order !== "number") {
      errors.push(`Поле "order" должно быть числом`)
    }

    if (data.status && typeof data.status !== "string") {
      errors.push(`Поле "status" должно быть строкой`)
    }

    if (
      typeof data.title === "string" &&
      (data.title.length < 3 || data.title.length > 150)
    ) {
      errors.push(`Поле "title" должно быть от 3 до 150 символов`)
    }

    if (typeof data.subTitle === "string" && data.subTitle.length > 250) {
      errors.push(`Поле "subTitle" не может быть длиннее 250 символов`)
    }

    if (typeof data.image === "string" && data.image.length > 300) {
      errors.push(`Поле "image" не может быть длиннее 300 символов`)
    }

    if (
      typeof data.status === "string" &&
      !["public", "hide", "basket"].includes(data.status)
    ) {
      errors.push(`Недопустимое значение поля "status"`)
    }

    if (typeof data.depositAmount === "number" && data.depositAmount < 0) {
      errors.push(`Поле "depositAmount" не может быть отрицательным`)
    }

    if (typeof data.order === "number" && data.order < 0) {
      errors.push(`Поле "order" должно быть положительным числом`)
    }

    if (errors.length > 0) {
      return context
    }

    return super.handle(context)
  }
}
