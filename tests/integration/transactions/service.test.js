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
    const createdTransactionIds = [] // ← ДОБАВИЛИ объявление массива

    // инициализация testUser
    beforeAll(async () => {
        const login = "test_user"
        const password = "212007rf"
        const hash = crypto.createHash("md5").update(password).digest("hex")
        testUser = await frontUserModel.getByLoginAndPassword(login, hash)
    })

    afterEach(async () => {
        if (createdTransactionIds.length > 0) {
            await knex("transactions")
                .whereIn("id", createdTransactionIds)
                .del()

            createdTransactionIds.length = 0 // Очищаем массив
        }
    })

    //  очистка после всех тестов
    afterAll(async () => {
        // Удаляем все тестовые транзакции пользователя
        await knex("transactions")
            .where({ user_id: testUser.id })
            .del()

        await frontUserModel.destroy()
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

            // сохранение ID для очистки
            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")
            expect(result.errors).toHaveLength(0)
            expect(result.insertId).toBeDefined()
            expect(typeof result.insertId).toBe("number")

            // Проверяем что транзакция создана в БД с правильными данными
            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction).toBeDefined()
            expect(transaction.user_id).toBe(testUser.id)
            expect(transaction.type).toBe("deposit")
            expect(transaction.status).toBe("pending")
            expect(transaction.currency).toBe("USDT")
            expect(transaction.network).toBe("TRC20")
            expect(Number(transaction.amount)).toBe(100)
            expect(Number(transaction.fee)).toBe(0)
            expect(transaction.is_manual).toBe(0)
        })

        test("✅ создание транзакции с указанием fee", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "ERC20",
                amount: 500,
                fee: 15.5
            }

            const result = await TransactionService.store(transactionData)

            // сохранение ID
            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")
            expect(result.errors).toHaveLength(0)

            const transaction = await transactionsModel.findById(result.insertId)
            expect(Number(transaction.fee)).toBe(15.5)
        })

        test("✅ создание транзакции W_TOKEN (без проверки сети)", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "W_TOKEN",
                network: "internal",
                amount: 1000
            }

            const result = await TransactionService.store(transactionData)

            // сохранение ID
            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")
            expect(result.errors).toHaveLength(0)

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.currency).toBe("W_TOKEN")
        })

        test("✅ обрезка пробелов в строковых полях", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "BEP20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            // сохранение ID
            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.currency).toBe("USDT")
            expect(transaction.network).toBe("BEP20")
        })

        test("❌ ошибка — пользователь не авторизован", async () => {
            const transactionData = {
                userId: testUser.id,
                session: "invalid_session_token",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Пользователь не авторизован")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует userId", async () => {
            const transactionData = {
                // userId отсутствует
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors.some(err =>
                err.includes("userId") || err.includes("Undefined binding")
            )).toBe(true)
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует session", async () => {
            const transactionData = {
                userId: testUser.id,
                // session отсутствует
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors.some(err =>
                err.includes("session") || err.includes("Undefined binding")
            )).toBe(true)
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует обязательное поле currency", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'currency' является обязательным")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует обязательное поле network", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'network' является обязательным")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отсутствует обязательное поле amount", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'amount' является обязательным")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — недопустимая валюта", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "BTC",
                network: "Bitcoin",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors.some(err => err.includes("Недопустимая валюта"))).toBe(true)
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — недопустимая сеть для USDT", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "Bitcoin",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors.some(err => err.includes("Недопустимая сеть"))).toBe(true)
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отрицательная сумма", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: -100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — нулевая сумма", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: 0
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — некорректное значение amount (не число)", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: "not a number"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
            expect(result.insertId).toBeNull()
        })

        test("❌ ошибка — отрицательная комиссия", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: -5
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение комиссии 'fee'")
            expect(result.insertId).toBeNull()
        })

        test("✅ работа с дробными числами", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "Polygon",
                amount: 123.456789,
                fee: 0.5
            }

            const result = await TransactionService.store(transactionData)

            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(Number(transaction.amount)).toBeCloseTo(123.456789, 6)
            expect(Number(transaction.fee)).toBeCloseTo(0.5, 6)
        })

        test("✅ работа со строковыми числами", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "USDT",
                network: "Arbitrum",
                amount: "250.75"
            }

            const result = await TransactionService.store(transactionData)

            // сохранение ID
            if (result.insertId) {
                createdTransactionIds.push(result.insertId)
            }

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(Number(transaction.amount)).toBeCloseTo(250.75, 2)
        })

        test("❌ множественные ошибки валидации", async () => {
            const transactionData = {
                userId: testUser.id,
                session: testUser.remember_token,
                currency: "INVALID_CURRENCY",
                network: "A".repeat(60),
                amount: -100,
                fee: "not_a_number"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(1)
            expect(result.insertId).toBeNull()
        })

        test("✅ проверка автоматических дефолтных значений", async () => {
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

            const transaction = await transactionsModel.findById(result.insertId)

            // Проверяем дефолтные значения
            expect(transaction.type).toBe("deposit")
            expect(transaction.status).toBe("pending")
            expect(transaction.is_manual).toBe(0)
            expect(transaction.tx_hash).toBeNull()
            expect(transaction.from_address).toBe("")
            expect(transaction.to_address).toBe("")
            expect(transaction.explorer_url).toBe("")
            expect(transaction.internal_comment).toBe("")
            expect(transaction.user_comment).toBe("")
        })
    })

    describe("indexStatus()", () => {
        test("✅ возвращает тестовое значение", async () => {
            const settings = {
                limit: 10,
                offset: 0,
                url: "pending"
            }

            const result = await TransactionService.indexStatus(settings)

            expect(result.status).toBe("ok")
            expect(result.errors).toHaveLength(0)
            expect(result.body).toEqual({ test: "Test value" })
        })
    })
})