require("module-alias/register")
require("@/config")
const NormalizeAmountHandler = require("@/handlers/NormalizeAmountHandler")

describe("NormalizeAmountHandler", () => {
    test("нормализует корректную сумму и пропускает дальше", async () => {
        const handler = new NormalizeAmountHandler()
        const context = { body: { amount: "10.5" }, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toHaveLength(0)
        expect(result.body.amount).toBe(10.5)
    })

    test("возвращает ошибку, если сумма не указана", async () => {
        const handler = new NormalizeAmountHandler()
        const context = { body: {}, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Не указана сумма")
    })

    test("возвращает ошибку, если сумма некорректна или <= 0", async () => {
        const handler = new NormalizeAmountHandler()

        const contexts = [
            { body: { amount: "abc" }, errors: [] },
            { body: { amount: 0 }, errors: [] },
            { body: { amount: -5 }, errors: [] }
        ]

        for (const ctx of contexts) {
            const result = await handler.handle(ctx)
            expect(result.errors).toContain("Сумма должна быть числом больше 0")
        }
    })

    test("не вызывает следующий хендлер при ошибке", async () => {
        const handler = new NormalizeAmountHandler()
        const nextHandler = { handle: jest.fn() }
        handler.setNext(nextHandler)

        const context = { body: { amount: 0 }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).not.toHaveBeenCalled()
        expect(result.errors).toContain("Сумма должна быть числом больше 0")
    })

    test("передаёт контекст следующему хендлеру при успехе", async () => {
        const handler = new NormalizeAmountHandler()
        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ nextHandled: true })
        }
        handler.setNext(nextHandler)

        const context = { body: { amount: 5 }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result).toEqual({ nextHandled: true })
    })
})


