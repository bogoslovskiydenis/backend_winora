require("module-alias/register")
require("@/config")
const PrepareTransactionDataInsertHandler = require("@/app/transactions/handlers/PrepareTransactionDataInsertHandler")

describe("PrepareTransactionDataInsertHandler", () => {
    const handler = new PrepareTransactionDataInsertHandler()

    test("✅ корректно подготавливает данные для вставки", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                status: "pending",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: 2.5,
                is_manual: false,
                tx_hash: null,
                from_address: "0x123",
                to_address: "0x456",
                explorer_url: "https://explorer.com",
                internal_comment: "test",
                user_comment: "user note"
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.prepareData).toEqual({
            user_id: 1,
            type: "deposit",
            status: "pending",
            currency: "USDT",
            network: "TRC20",
            amount: 100,
            fee: 2.5,
            is_manual: false,
            tx_hash: null,
            from_address: "0x123",
            to_address: "0x456",
            explorer_url: "https://explorer.com",
            internal_comment: "test",
            user_comment: "user note"
        })
        expect(result.errors).toHaveLength(0)
    })

    test("✅ конвертирует строковые числа в Number", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                status: "pending",
                currency: "USDT",
                network: "TRC20",
                amount: "100.50",
                fee: "2.5",
                is_manual: false,
                tx_hash: null,
                from_address: "",
                to_address: "",
                explorer_url: "",
                internal_comment: "",
                user_comment: ""
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.prepareData.amount).toBe(100.50)
        expect(result.prepareData.fee).toBe(2.5)
        expect(typeof result.prepareData.amount).toBe("number")
        expect(typeof result.prepareData.fee).toBe("number")
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

        expect(result.prepareData).toBeUndefined()
        expect(result.errors).toContain("Предыдущая ошибка")
    })
})