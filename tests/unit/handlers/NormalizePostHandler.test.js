require("module-alias/register")
require("@/config")

const handlersConfig = [
    {
        name: "Bonuses NormalizePostHandler",
        modulePath: "@/app/bonuses/handlers/NormalizePostHandler",
        fields: ["depositAmount", "order"]
    },
    {
        name: "Box NormalizePostHandler",
        modulePath: "@/app/box/handlers/NormalizePostHandler",
        fields: ["depositAmount", "order"]
    },
    {
        name: "Shares NormalizePostHandler",
        modulePath: "@/app/shares/handlers/NormalizePostHandler",
        fields: ["depositAmount", "order"]
    },
    {
        name: "Investments NormalizePostHandler",
        modulePath: "@/app/investments/handlers/NormalizePostHandler",
        fields: ["user_id", "amount_usd", "custom_preset_id"]
    }
]

describe("NormalizePostHandler family", () => {
    handlersConfig.forEach(({ name, modulePath, fields }) => {
        // eslint-disable-next-line global-require
        const HandlerClass = require(modulePath)

        describe(name, () => {
            let handler

            beforeEach(() => {
                handler = new HandlerClass()
            })

            test("преобразует строковые числа в Number", async () => {
                const body = {}
                fields.forEach((field, index) => {
                    body[field] = `${index + 1}.5`
                })

                const context = { body, errors: [] }
                const result = await handler.handle(context)

                fields.forEach((field, index) => {
                    expect(result.body[field]).toBe(index + 1.5)
                })
                expect(result.errors).toHaveLength(0)
            })

            test("добавляет ошибку при нечисловых значениях и не вызывает следующий хендлер",
                async () => {
                    const invalidField = fields[0]
                    const context = {
                        body: { [invalidField]: "not-a-number" },
                        errors: []
                    }

                    const nextHandler = { handle: jest.fn() }
                    handler.setNext(nextHandler)

                    const result = await handler.handle(context)

                    expect(result.errors).toContain(
                        `Поле "${invalidField}" должно быть числом`
                    )
                    expect(result.body[invalidField]).toBe("not-a-number")
                    expect(nextHandler.handle).not.toHaveBeenCalled()
                })

            test("игнорирует null и undefined значения", async () => {
                const body = {}
                fields.forEach((field, index) => {
                    body[field] = index % 2 === 0 ? null : undefined
                })

                const context = { body, errors: [] }
                const result = await handler.handle(context)

                fields.forEach((field, index) => {
                    expect(result.body[field]).toBe(index % 2 === 0 ? null : undefined)
                })
                expect(result.errors).toHaveLength(0)
            })

            test("передает context дальше при отсутствии ошибок", async () => {
                const body = {}
                fields.forEach((field) => {
                    body[field] = "1"
                })

                const nextHandler = {
                    handle: jest.fn().mockResolvedValue({ forwarded: true })
                }
                handler.setNext(nextHandler)

                const context = { body, errors: [] }
                const result = await handler.handle(context)

                expect(nextHandler.handle).toHaveBeenCalledWith(context)
                expect(result).toEqual({ forwarded: true })
            })
        })
    })
})


