require("module-alias/register")
require("@/config")

const knex = require("@/db")
const ExecuteBalanceOperationHandler = require("@/app/balance/handlers/ExecuteBalanceOperationHandler")

describe("ExecuteBalanceOperationHandler", () => {
    let handler
    let testUserId = 11
    let insertedLogIds = []

    beforeEach(async () => {
        handler = new ExecuteBalanceOperationHandler()
        insertedLogIds = []
        await knex("users_balance").where({ user_id: testUserId }).del()
        await knex("balance_changes").where({ user_id: testUserId }).del()
    })

    afterEach(async () => {
        await knex("users_balance").where({ user_id: testUserId }).del()
        await knex("balance_changes").where({ user_id: testUserId }).del()
    })

    test("пропускает обработку, если есть ошибки", async () => {
        const context = {
            errors: ["предыдущая ошибка"],
            body: { operation: "deposit", user_id: testUserId, amount: 100, currency: "USDT" }
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("предыдущая ошибка")
        expect(result.errors.length).toBe(1)
    })

    test("выполняет операцию deposit и создает запись в балансе, если её нет", async () => {
        const context = {
            errors: [],
            body: {
                operation: "deposit",
                user_id: testUserId,
                amount: 50,
                currency: "W_TOKEN",
                editorId: 1,
                comment: "Тестовый депозит"
            }
        }

        await handler.handle(context)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "W_TOKEN", operation: "deposit" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)

        expect(logEntry).toMatchObject({
            user_id: testUserId,
            currency: "W_TOKEN",
            operation: "deposit",
            amount: expect.anything(),
            change_source: "admin",
            changed_by_admin_id: 1,
            changed_by_user_id: null,
            comment: "Тестовый депозит"
        })

        const balance = await knex("users_balance")
            .where({ user_id: testUserId, currency: "W_TOKEN" })
            .first()

        expect(balance).toBeDefined()
        expect(Number(balance.balance)).toBeGreaterThanOrEqual(50)
    })

    test("выполняет операцию deposit и обновляет существующий баланс", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 100,
            locked_balance: 0,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "deposit",
                user_id: testUserId,
                amount: 25,
                currency: "USDT",
                editorId: 1,
                comment: "Дополнительный депозит"
            }
        }

        await handler.handle(context)

        const balance = await knex("users_balance")
            .where({ user_id: testUserId, currency: "USDT" })
            .first()

        expect(Number(balance.balance)).toBeGreaterThanOrEqual(125)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "USDT", operation: "deposit" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)
        expect(logEntry.change_source).toBe("admin")
        expect(logEntry.changed_by_admin_id).toBe(1)
        expect(logEntry.comment).toBe("Дополнительный депозит")
    })

    test("выполняет операцию withdraw и записывает лог с change_source=admin", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 200,
            locked_balance: 0,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "withdraw",
                user_id: testUserId,
                amount: 50,
                currency: "USDT",
                editorId: 1,
                comment: "Списание средств"
            }
        }

        await handler.handle(context)

        const balance = await knex("users_balance")
            .where({ user_id: testUserId, currency: "USDT" })
            .first()

        expect(Number(balance.balance)).toBeLessThanOrEqual(150)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "USDT", operation: "withdraw" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)
        expect(logEntry.change_source).toBe("admin")
        expect(logEntry.changed_by_admin_id).toBe(1)
        expect(logEntry.changed_by_user_id).toBeNull()
        expect(logEntry.comment).toBe("Списание средств")
    })

    test("выполняет операцию freeze и записывает лог", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 300,
            locked_balance: 0,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "freeze",
                user_id: testUserId,
                amount: 100,
                currency: "USDT",
                editorId: 1,
                comment: "Заморозка средств"
            }
        }

        await handler.handle(context)

        const balance = await knex("users_balance")
            .where({ user_id: testUserId, currency: "USDT" })
            .first()

        expect(Number(balance.balance)).toBeLessThanOrEqual(200)
        expect(Number(balance.locked_balance)).toBeGreaterThanOrEqual(100)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "USDT", operation: "freeze" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)
        expect(logEntry.change_source).toBe("admin")

        await knex("users_balance").where({ user_id: testUserId, currency: "USDT" }).del()
    })

    test("выполняет операцию unfreeze и записывает лог", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 100,
            locked_balance: 150,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "unfreeze",
                user_id: testUserId,
                amount: 80,
                currency: "USDT",
                editorId: 1,
                comment: "Разморозка средств"
            }
        }

        await handler.handle(context)

        const balance = await knex("users_balance")
            .where({ user_id: testUserId, currency: "USDT" })
            .first()

        expect(Number(balance.balance)).toBeGreaterThanOrEqual(180)
        expect(Number(balance.locked_balance)).toBeLessThanOrEqual(70)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "USDT", operation: "unfreeze" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)
        expect(logEntry.change_source).toBe("admin")
    })

    test("записывает лог с change_source=self и changed_by_user_id, если editorId отсутствует", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 500,
            locked_balance: 0,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "deposit",
                user_id: testUserId,
                amount: 30,
                currency: "USDT",
                comment: "Самостоятельный депозит"
            }
        }

        await handler.handle(context)

        const logEntry = await knex("balance_changes")
            .where({ user_id: testUserId, currency: "USDT", operation: "deposit" })
            .orderBy("id", "desc")
            .first()

        expect(logEntry).toBeDefined()
        insertedLogIds.push(logEntry.id)
        expect(logEntry.change_source).toBe("self")
        expect(logEntry.changed_by_admin_id).toBeNull()
        expect(logEntry.changed_by_user_id).toBe(testUserId)
        expect(logEntry.comment).toBe("Самостоятельный депозит")
    })

    test("добавляет ошибку при неизвестной операции", async () => {
        const context = {
            errors: [],
            body: {
                operation: "unknown_operation",
                user_id: testUserId,
                amount: 100,
                currency: "USDT"
            }
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Ошибка операции с балансом: Неизвестная операция с балансом")
    })

    test("добавляет ошибку при неудачном списании (недостаточно средств)", async () => {
        await knex("users_balance").insert({
            user_id: testUserId,
            currency: "USDT",
            balance: 10,
            locked_balance: 0,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        })

        const context = {
            errors: [],
            body: {
                operation: "withdraw",
                user_id: testUserId,
                amount: 100,
                currency: "USDT"
            }
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("Ошибка операции с балансом: Не удалось списать средства")
    })
})


