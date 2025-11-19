require("module-alias/register")
require("@/config")

const CurrencyConversionService = require("@/services/CurrencyConversionService")

describe("CurrencyConversionService", () => {
    let optionsMock

    beforeEach(() => {
        jest.clearAllMocks()
        optionsMock = {
            getByKey: jest.fn()
        }
        CurrencyConversionService.optionsModel = optionsMock
    })

    test("возвращает курс по ключу", async () => {
        optionsMock.getByKey.mockResolvedValue({ value: "1.23" })

        const rate = await CurrencyConversionService.getRate({
            from: "W_TOKEN",
            to: "USDT"
        })

        expect(optionsMock.getByKey).toHaveBeenCalledWith("USDT/W_TOKEN")
        expect(rate).toBe(1.23)
    })

    test("бросает ошибку, если курс не найден", async () => {
        optionsMock.getByKey.mockResolvedValue(null)

        await expect(
            CurrencyConversionService.getRate({ from: "W_TOKEN", to: "USDT" })
        ).rejects.toThrow("Курс USDT/W_TOKEN не задан")
    })

    test("бросает ошибку, если курс некорректный", async () => {
        optionsMock.getByKey.mockResolvedValue({ value: "-5" })

        await expect(
            CurrencyConversionService.getRate({ from: "W_TOKEN", to: "USDT" })
        ).rejects.toThrow("Некорректный курс USDT/W_TOKEN")
    })

    test("конвертирует сумму по курсу", async () => {
        optionsMock.getByKey.mockResolvedValue({ value: "2" })

        const result = await CurrencyConversionService.convert(10, {
            from: "W_TOKEN",
            to: "USDT"
        })

        expect(result).toEqual({
            originalAmount: 10,
            originalCurrency: "W_TOKEN",
            convertedCurrency: "USDT",
            rate: 2,
            amountUsdt: 20
        })
    })

    test("конвертация поддерживает forceRateReload", async () => {
        optionsMock.getByKey.mockResolvedValueOnce({ value: "1" })
        optionsMock.getByKey.mockResolvedValueOnce({ value: "2" })

        const first = await CurrencyConversionService.convert(5)
        expect(first.amountUsdt).toBe(5)

        const second = await CurrencyConversionService.convert(5, {
            forceRateReload: true
        })
        expect(second.amountUsdt).toBe(10)
    })

    test("бросает ошибку при пустой сумме", async () => {
        await expect(CurrencyConversionService.convert(null)).rejects.toThrow(
            "Не указана сумма для конвертации"
        )
    })

    test("бросает ошибку при некорректном числе", async () => {
        await expect(
            CurrencyConversionService.convert("abc", { from: "W_TOKEN", to: "USDT" })
        ).rejects.toThrow("Некорректная сумма")
    })
})

