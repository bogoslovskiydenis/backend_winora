const BaseHandler = require("@/core/BaseHandler")
/**
 * Хендлер для проверки корректности типа пресета (preset_type)
 *
 * Вход в context.body:
 *  - preset_type (строка)
 *
 * Доступные значения:
 *  - conservative
 *  - balanced
 *  - aggressive
 *  - custom
 */
module.exports = class ValidatePresetTypeHandler extends BaseHandler {
  constructor(allowedPresets = []) {
    super()
    this.allowedPresets = allowedPresets
  }

  async handle(context) {
    const { body, errors } = context
    const { preset_type } = body

    if (!preset_type) {
      errors.push("Поле preset_type обязательно для заполнения")
      return context
    }

    if (!this.allowedPresets.includes(preset_type)) {
      errors.push(
        `Недопустимое значение preset_type: "${preset_type}". Доступные варианты: ${this.allowedPresets.join(", ")}`
      )
      return context
    }

    return super.handle(context)
  }
}
