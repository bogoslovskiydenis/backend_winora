require("module-alias/register")
require("@/config")
const SetDepositTransactionDefaultsHandler = require("@/app/transactions/handlers/SetDepositTransactionDefaultsHandler")

describe("SetDepositTransactionDefaultsHandler", () => {
    const handler = new SetDepositTransactionDefaultsHandler()

    test("✅ устанавливает корректные дефолтные значения для депозита", async () => {
        const context = {
            body: {
                userId: 1,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.type).toBe("deposit")
        expect(result.body.status).toBe("pending")
        expect(result.body.fee).toBe(0)
        expect(result.body.is_manual).toBe(false)
        expect(result.body.tx_hash).toBeNull()
        expect(result.body.from_address).toBe("")
        expect(result.body.to_address).toBe("")
        expect(result.body.explorer_url).toBe("")
        expect(result.body.internal_comment).toBe("")
        expect(result.body.user_comment).toBe("")
        expect(result.errors).toHaveLength(0)
    })

    test("✅ сохраняет существующее значение fee если оно указано", async () => {
        const context = {
            body: {
                userId: 1,
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: 2.5
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.fee).toBe(2.5)
        expect(result.errors).toHaveLength(0)
    })

    test("✅ не перезаписывает существующие необязательные поля", async () => {
        const context = {
            body: {
                userId: 1,
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                from_address: "0xABC",
                internal_comment: "Test"
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.from_address).toBe("")
        expect(result.body.internal_comment).toBe("")
        expect(result.errors).toHaveLength(0)
    })

    test("✅ пропускает обработку при наличии ошибок", async () => {
        const context = {
            body: {
                userId: 1
            },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(result.body.type).toBeUndefined()
        expect(result.errors).toContain("Предыдущая ошибка")
    })
})