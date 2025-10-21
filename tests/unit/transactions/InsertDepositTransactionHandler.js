require("module-alias/register")
require("@/config")
const InsertDepositTransactionHandler = require("@/app/transactions/handlers/InsertDepositTransactionHandler")
const transactionModel = require("@/models/Transactions")

describe("InsertDepositTransactionHandler", () => {
    const handler = new InsertDepositTransactionHandler()

    test("✅ успешная вставка транзакции в БД", async () => {
        const context = {
            prepareData: {
                user_id: 11,
                type: "deposit",
                status: "pending",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: 0,
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

        expect(result.insertId).toBeDefined()
        expect(typeof result.insertId).toBe("number")
        expect(result.errors).toHaveLength(0)

        // Проверяем что транзакция действительно создалась
        const transaction = await transactionModel.findById(result.insertId)
        expect(transaction).toBeDefined()
        expect(transaction.user_id).toBe(11)
        expect(transaction.currency).toBe("USDT")
        expect(transaction.amount).toBe("100.000000000000000000")
    })

    test("✅ пропускает обработку при наличии ошибок", async () => {
        const context = {
            prepareData: {},
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(result.insertId).toBeUndefined()
        expect(result.errors).toContain("Предыдущая ошибка")
    })

    test("❌ ошибка при некорректных данных для вставки", async () => {
        const context = {
            prepareData: {
                // отсутствуют обязательные поля
                user_id: null
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain("Ошибка при работе с базой")
    })
})