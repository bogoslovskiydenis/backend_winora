const OptionsModelKnex = require("@/models/OptionsKnex")
const optionsSchema = require("@/schemas/options")

class CurrencyConversionService {
    constructor() {
        this.optionsModel = new OptionsModelKnex(optionsSchema)
    }

    #buildKey(from, to) {
        return `${to}/${from}`.toUpperCase()
    }

    async #fetchRate(from, to) {
        const optionKey = this.#buildKey(from, to)
        const option = await this.optionsModel.getByKey(optionKey)
        if (!option || option.value === "") {
            throw new Error(`Курс ${optionKey} не задан`)
        }

        const rate = Number(option.value)
        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error(`Некорректный курс ${optionKey}`)
        }

        return rate
    }

    async getRate({ from = "W_TOKEN", to = "USDT" } = {}) {
        return this.#fetchRate(from, to)
    }

    async convert(amount, { from = "W_TOKEN", to = "USDT", forceRateReload = false } = {}) {
        if (amount == null || amount === "") {
            throw new Error("Не указана сумма для конвертации")
        }

        const value = Number(amount)
        if (!Number.isFinite(value) || value < 0) {
            throw new Error("Некорректная сумма")
        }

        const rate = await (forceRateReload
            ? this.#fetchRate(from, to)
            : this.getRate({ from, to }))
        const amountUsdt = Number((value * rate).toFixed(8))

        return {
            originalAmount: value,
            originalCurrency: from,
            convertedCurrency: to,
            rate,
            amountUsdt
        }
    }
}

module.exports = new CurrencyConversionService()

