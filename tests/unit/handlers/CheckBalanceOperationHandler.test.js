const CheckBalanceOperationHandler = require("@/app/balance/handlers/CheckBalanceOperationHandler")

describe("CheckBalanceOperationHandler", () => {
    test("пропускает обработку при допустимой операции", async () => {
        const handler = new CheckBalanceOperationHandler(["deposit", "withdraw"])
        const context = { body: { operation: "deposit" }, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toHaveLength(0)
    })

    test("возвращает ошибку, если операция не указана", async () => {
        const handler = new CheckBalanceOperationHandler()
        const context = { body: {}, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Не указана операция с балансом")
    })

    test("возвращает ошибку, если операция не входит в список разрешённых", async () => {
        const handler = new CheckBalanceOperationHandler(["deposit"])
        const context = { body: { operation: "withdraw" }, errors: [] }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Операция с балансом недоступна")
    })

    test("не вызывает следующего хендлера при ошибке", async () => {
        const handler = new CheckBalanceOperationHandler(["deposit"])
        const nextHandler = { handle: jest.fn() }
        handler.setNext(nextHandler)

        const context = { body: { operation: "freeze" }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).not.toHaveBeenCalled()
        expect(result.errors).toContain("Операция с балансом недоступна")
    })

    test("передаёт контекст следующему хендлеру при успехе", async () => {
        const handler = new CheckBalanceOperationHandler(["deposit"])
        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ nextHandled: true })
        }
        handler.setNext(nextHandler)

        const context = { body: { operation: "deposit" }, errors: [] }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result).toEqual({ nextHandled: true })
    })
})


