require("module-alias/register")
require("@/config")
const TrimTransactionFieldsHandler = require("@/app/transactions/handlers/TrimTransactionFieldsHandler")

describe("TrimTransactionFieldsHandler", () => {
    const handler = new TrimTransactionFieldsHandler()

    test("✅ успешная обрезка пробелов во всех строковых полях", async () => {
        const context = {
            body: {
                currency: "  USDT  ",
                network: "  TRC20  ",
                from_address: "  0x123abc  ",
                to_address: "  0x456def  ",
                explorer_url: "  https://explorer.com  ",
                internal_comment: "  test comment  ",
                user_comment: "  user note  "
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.currency).toBe("USDT")
        expect(result.body.network).toBe("TRC20")
        expect(result.body.from_address).toBe("0x123abc")
        expect(result.body.to_address).toBe("0x456def")
        expect(result.body.explorer_url).toBe("https://explorer.com")
        expect(result.body.internal_comment).toBe("test comment")
        expect(result.body.user_comment).toBe("user note")
        expect(result.errors).toHaveLength(0)
    })

    test("✅ корректная обработка отсутствующих полей", async () => {
        const context = {
            body: {
                currency: "  USDT  ",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.currency).toBe("USDT")
        expect(result.body.amount).toBe(100)
        expect(result.errors).toHaveLength(0)
    })

    test("✅ не обрабатывает нестроковые значения", async () => {
        const context = {
            body: {
                currency: "  USDT  ",
                amount: 100,
                userId: 5,
                metadata: { key: "value" }
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.currency).toBe("USDT")
        expect(result.body.amount).toBe(100)
        expect(result.body.userId).toBe(5)
        expect(result.body.metadata).toEqual({ key: "value" })
        expect(result.errors).toHaveLength(0)
    })

    test("✅ пропускает обработку при наличии ошибок", async () => {
        const context = {
            body: {
                currency: "  USDT  "
            },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(result.body.currency).toBe("  USDT  ") // не обрезано
        expect(result.errors).toContain("Предыдущая ошибка")
    })
})