const CheckBalanceCurrencyHandler = require("@/app/balance/handlers/CheckBalanceCurrencyHandler")

describe("CheckBalanceCurrencyHandler", () => {
    test("пропускает обработку при допустимой валюте", async () => {
        const handler = new CheckBalanceCurrencyHandler(["USDT", "W_TOKEN"])
        const context = { body: { currency: "usdt" }, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toHaveLength(0)
        expect(result.body.currency).toBe("USDT")
    })

    test("возвращает ошибку, если валюта не указана", async () => {
        const handler = new CheckBalanceCurrencyHandler()
        const context = { body: {}, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Не указана валюта баланса")
    })

    test("возвращает ошибку, если валюта не входит в список разрешённых", async () => {
        const handler = new CheckBalanceCurrencyHandler(["USDT"])
        const context = { body: { currency: "W_TOKEN" }, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Валюта баланса недоступна")
    })

    test("не вызывает следующий хендлер при ошибке", async () => {
        const handler = new CheckBalanceCurrencyHandler(["USDT"])
        const nextHandler = { handle: jest.fn() }
        handler.setNext(nextHandler)

        const context = { body: { currency: "W_TOKEN" }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).not.toHaveBeenCalled()
        expect(result.errors).toContain("Валюта баланса недоступна")
    })

    test("передаёт контекст следующему хендлеру при успехе", async () => {
        const handler = new CheckBalanceCurrencyHandler(["USDT"])
        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ nextHandled: true })
        }
        handler.setNext(nextHandler)

        const context = { body: { currency: "USDT" }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result).toEqual({ nextHandled: true })
    })
})


