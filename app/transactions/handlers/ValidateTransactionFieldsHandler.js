const BaseHandler = require("@/core/BaseHandler")

module.exports = class ValidateTransactionFieldsHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context

    const requiredFields = ["userId", "type", "currency", "network", "amount"]
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        errors.push(`Поле '${field}' является обязательным`)
      }
    }

    const allowedTypes = ["deposit", "withdrawal", "transfer"]
    if (!allowedTypes.includes(body.type)) {
      errors.push(`Недопустимый тип транзакции: '${body.type}'`)
    }

    const allowedStatuses = [
      "pending",
      "processing",
      "confirmed",
      "failed",
      "canceled"
    ]
    if (body.status && !allowedStatuses.includes(body.status)) {
      errors.push(`Недопустимый статус транзакции: '${body.status}'`)
    }

    if (isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      errors.push(`Неверное значение суммы 'amount'`)
    }

    if (body.fee && (isNaN(Number(body.fee)) || Number(body.fee) < 0)) {
      errors.push(`Неверное значение комиссии 'fee'`)
    }

    if (typeof body.currency === "string") {
      if (body.currency.length > 20) {
        errors.push(
          `Поле 'currency' превышает максимально допустимую длину (20)`
        )
      }

      if (!_AVAILABLE_CURRENCY.includes(body.currency.toUpperCase())) {
        errors.push(
          `Недопустимая валюта '${body.currency}'. Доступные: ${_AVAILABLE_CURRENCY.join(", ")}`
        )
      }
    }

    if (typeof body.network === "string" && body.currency !== "W_TOKEN") {
      if (body.network.length > 50) {
        errors.push(
          `'Поле 'network' превышает максимально допустимую длину (50)`
        )
      }
      const upperCurrency = body.currency?.toUpperCase()
      const availableNetworks = _AVAILABLE_NETWORK?.[upperCurrency]

      if (!availableNetworks) {
        errors.push(`Для валюты '${upperCurrency}' не заданы доступные сети`)
      } else if (!availableNetworks.includes(body.network)) {
        errors.push(
          `Недопустимая сеть '${body.network}' для валюты '${upperCurrency}'. Доступные: ${availableNetworks.join(", ")}`
        )
      }
    }

    if (errors.length > 0) return context
    return super.handle(context)
  }
}
