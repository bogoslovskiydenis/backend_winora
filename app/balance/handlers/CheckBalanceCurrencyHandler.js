const BaseHandler = require("@/core/BaseHandler")

const DEFAULT_CURRENCIES = ["USDT", "W_TOKEN"]

module.exports = class CheckBalanceCurrencyHandler extends BaseHandler {
    constructor(allowedCurrencies = DEFAULT_CURRENCIES) {
        super()
        this.allowedCurrencies = allowedCurrencies
    }

    async handle(context) {
        const { errors, body = {} } = context
        const { currency } = body

        if (errors.length > 0) return context

        if (!currency) {
            errors.push("Не указана валюта баланса")
            return context
        }

        const normalized = String(currency).toUpperCase()

        if (!this.allowedCurrencies.includes(normalized)) {
            errors.push("Валюта баланса недоступна")
            return context
        }

        body.currency = normalized

        return super.handle(context)
    }
}


