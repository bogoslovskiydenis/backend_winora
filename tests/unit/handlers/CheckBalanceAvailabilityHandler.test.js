jest.mock("@/models/UserBalance", () => ({
    findByUserId: jest.fn()
}))

const userBalanceModel = require("@/models/UserBalance")
const CheckBalanceAvailabilityHandler = require("@/app/balance/handlers/CheckBalanceAvailabilityHandler")

describe("CheckBalanceAvailabilityHandler", () => {
    let handler

    beforeEach(() => {
        handler = new CheckBalanceAvailabilityHandler()
        jest.clearAllMocks()
    })

    test("пропускает операцию deposit без проверки баланса", async () => {
        const context = {
            body: { operation: "deposit", user_id: 1, amount: 100, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(userBalanceModel.findByUserId).not.toHaveBeenCalled()
        expect(result.errors).toHaveLength(0)
    })

    test("успешное списание при достаточном балансе", async () => {
        userBalanceModel.findByUserId.mockResolvedValue({
            balance: "150",
            locked_balance: "20"
        })

        const context = {
            body: { operation: "withdraw", user_id: 1, amount: 50, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(userBalanceModel.findByUserId).toHaveBeenCalledWith(1, "USDT")
        expect(result.errors).toHaveLength(0)
    })

    test("ошибка при недостатке средств для списания", async () => {
        userBalanceModel.findByUserId.mockResolvedValue({
            balance: "30",
            locked_balance: "0"
        })

        const context = {
            body: { operation: "withdraw", user_id: 1, amount: 50, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Недостаточно средств на счету")
    })

    test("успешный фриз при достаточном балансе", async () => {
        userBalanceModel.findByUserId.mockResolvedValue({
            balance: "100",
            locked_balance: "0"
        })

        const context = {
            body: { operation: "freeze", user_id: 1, amount: 40, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toHaveLength(0)
    })

    test("успешная разморозка при достаточном locked_balance", async () => {
        userBalanceModel.findByUserId.mockResolvedValue({
            balance: "10",
            locked_balance: "70"
        })

        const context = {
            body: { operation: "unfreeze", user_id: 1, amount: 50, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toHaveLength(0)
    })

    test("ошибка при недостатке замороженных средств для разморозки", async () => {
        userBalanceModel.findByUserId.mockResolvedValue({
            balance: "10",
            locked_balance: "30"
        })

        const context = {
            body: { operation: "unfreeze", user_id: 1, amount: 50, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Недостаточно замороженных средств")
    })

    test("ошибка, если баланс не найден", async () => {
        userBalanceModel.findByUserId.mockResolvedValue(null)

        const context = {
            body: { operation: "withdraw", user_id: 1, amount: 10, currency: "USDT" },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Баланс пользователя не найден")
    })
})


