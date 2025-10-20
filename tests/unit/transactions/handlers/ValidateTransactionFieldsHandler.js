require("module-alias/register")
require("@/config")
const ValidateTransactionFieldsHandler = require("@/app/transactions/handlers/ValidateTransactionFieldsHandler")

describe("ValidateTransactionFieldsHandler", () => {
    const handler = new ValidateTransactionFieldsHandler()

    test("✅ успешная валидация корректных данных", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: 0
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toHaveLength(0)
    })

    test("❌ ошибка — отсутствуют обязательные поля", async () => {
        const context = {
            body: {
                userId: 1
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Поле 'type' является обязательным")
        expect(result.errors).toContain("Поле 'currency' является обязательным")
        expect(result.errors).toContain("Поле 'network' является обязательным")
        expect(result.errors).toContain("Поле 'amount' является обязательным")
    })

    test("❌ ошибка — недопустимый тип транзакции", async () => {
        const context = {
            body: {
                userId: 1,
                type: "invalid_type",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain("Недопустимый тип транзакции: 'invalid_type'")
    })

    test("❌ ошибка — недопустимый статус транзакции", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                status: "invalid_status"
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain("Недопустимый статус транзакции: 'invalid_status'")
    })

    test("❌ ошибка — неверное значение amount", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 0
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain("Неверное значение суммы 'amount'")
    })

    test("❌ ошибка — отрицательное значение amount", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: -100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain("Неверное значение суммы 'amount'")
    })

    test("❌ ошибка — неверное значение fee", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: -5
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain("Неверное значение комиссии 'fee'")
    })

    test("❌ ошибка — недопустимая валюта", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "INVALID_COIN",
                network: "TRC20",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain(
            "Недопустимая валюта 'INVALID_COIN'. Доступные: USDT, W_TOKEN"
        )
    })

    test("❌ ошибка — недопустимая сеть для валюты", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "INVALID_NETWORK",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain(
            "Недопустимая сеть 'INVALID_NETWORK' для валюты 'USDT'. Доступные: ERC20, TRC20, BEP20, Polygon, Arbitrum"
        )
    })

    test("✅ корректная валидация валюты в любом регистре", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "usdt",
                network: "TRC20",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toHaveLength(0)
    })

    test("✅ W_TOKEN не требует проверки сети", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "W_TOKEN",
                network: "ANY_NETWORK",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toHaveLength(0)
    })

    test("❌ ошибка — превышение длины поля currency", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "A".repeat(21),
                network: "TRC20",
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain(
            "Поле 'currency' превышает максимально допустимую длину (20)"
        )
    })

    test("❌ ошибка — превышение длины поля network", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "A".repeat(51),
                amount: 100
            },
            errors: []
        }

        const result = await handler.handle(context)
        expect(result.errors).toContain(
            "'Поле 'network' превышает максимально допустимую длину (50)"
        )
    })

    test("✅ пропускает обработку при наличии предыдущих ошибок", async () => {
        const context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)
        expect(result.errors).toEqual(["Предыдущая ошибка"])
    })
})