require("module-alias/register")
require("@/config")
const TransactionService = require("@/app/transactions/service")
const FrontUsersModel = require("@/models/FrontUsers")
const transactionsModel = require("@/models/Transactions")
const knex = require("@/db")
const crypto = require("crypto")

describe("TransactionService", () => {
    const frontUserModel = new FrontUsersModel()
    let testUser
    const createdTransactionIds = []

    beforeAll(async () => {
        const login = "test_user"
        const password = "212007rf"
        const hash = crypto.createHash("md5").update(password).digest("hex")

        // 1. Находим пользователя
        const user = await frontUserModel.getByLoginAndPassword(login, hash)
        if (!user) {
            throw new Error("Тестовый пользователь 'test_user' не найден в базе данных.")
        }
        testUser = user

        // 2. Генерируем и сохраняем для него свежий токен сессии
        const newRememberToken = crypto.randomBytes(20).toString('hex')
        await frontUserModel.updateRememberTokenById(testUser.id, newRememberToken)

        // 3. Обновляем наш локальный объект пользователя этим токеном
        testUser.remember_token = newRememberToken

        // 4. Очищаем старые транзакции для чистоты теста
        await knex("transactions").where({ user_id: testUser.id }).del()
    })

    afterEach(async () => {
        if (createdTransactionIds.length > 0) {
            await knex("transactions").whereIn("id", createdTransactionIds).del()
            createdTransactionIds.length = 0
        }
    })

    afterAll(async () => {
        await knex("transactions").where({ user_id: testUser.id }).del()
        await frontUserModel.destroy()
        await knex.destroy()
    })

    describe("store()", () => {
        test("✅ успешное создание транзакции депозита со всеми обязательными полями", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")
            expect(result.errors).toHaveLength(0)
            expect(result.insertId).toBeDefined()

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.user_id).toBe(testUser.id)
            expect(transaction.currency).toBe("USDT")
        })

        test("❌ ошибка — пользователь не авторизован (неверный session)", async () => {
            const result = await TransactionService.store({
                userId: testUser.id,
                session: "invalid_session_token",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            })

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Пользователь не авторизован")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует userId", async () => {
            const result = await TransactionService.store({
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            })

            expect(result.status).toBe("error")
            expect(result.errors.some(err => err.includes("Ошибка при работе с базой"))).toBe(true)
        });

        test("❌ ошибка — отсутствует session", async () => {
            const result = await TransactionService.store({
                userId: testUser.id,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            })

            expect(result.status).toBe("error")
            expect(result.errors.some(err => err.includes("Ошибка при работе с базой"))).toBe(true)
        })

        test("❌ ошибка — отсутствует обязательное поле currency", async () => {
            const result = await TransactionService.store({
                userId: testUser.id,
                session: testUser.remember_token,
                network: "TRC20",
                amount: 100
            })

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'currency' является обязательным")
        })

        test("❌ ошибка — недопустимая валюта (из-за пробелов, т.к. валидация до тримминга)", async () => {
            const result = await TransactionService.store({
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "  USDT  ",
                network: "TRC20",
                amount: 100
            })

            expect(result.status).toBe("error")
            expect(result.errors.some(err => err.includes("Недопустимая валюта"))).toBe(true)
        })

        test("❌ ошибка — отрицательная сумма", async () => {
            const result = await TransactionService.store({
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: -100
            })

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
        })
    })

    describe("indexStatus()", () => {
        beforeAll(async () => {
            await knex("transactions").where({ user_id: testUser.id }).del()
            createdTransactionIds.length = 0

            const transactionsToCreate = [
                { user_id: testUser.id, status: 'pending', currency: 'USDT', network: 'TRC20', amount: 100, type: 'deposit' },
                { user_id: testUser.id, status: 'pending', currency: 'USDT', network: 'TRC20', amount: 200, type: 'deposit' },
                { user_id: testUser.id, status: 'confirmed', currency: 'USDT', network: 'TRC20', amount: 300, type: 'deposit' },
            ];
            const insertedIds = await knex("transactions").insert(transactionsToCreate);
            createdTransactionIds.push(...insertedIds);
        });

        test("✅ должен возвращать список транзакций и общее количество", async () => {
            const settings = { limit: 10, offset: 0, url: "pending" }
            const result = await TransactionService.indexStatus(settings)

            expect(result.status).toBe("ok")
            expect(result.body.posts).toBeInstanceOf(Array)
            expect(result.body.posts.length).toBeGreaterThanOrEqual(2)
            expect(result.body.total).toBeGreaterThanOrEqual(2)
        })

        test("❌ должен возвращать ошибку для невалидного статуса", async () => {
            const settings = { limit: 10, offset: 0, url: "invalid_status" }
            const result = await TransactionService.indexStatus(settings)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле статус не валидно")
        })
    })
})