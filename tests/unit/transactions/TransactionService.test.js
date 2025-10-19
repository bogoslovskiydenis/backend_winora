require("module-alias/register")
require("@/config")
const TransactionService = require("@/app/transactions/service")
const FrontUsersModel = require("@/models/FrontUsers")
const TransactionsModel = require("@/models/Transactions")
const crypto = require("crypto")

const frontUsersModel = new FrontUsersModel()
const transactionsModel = TransactionsModel

// Тестовые данные пользователя (как в вашем FrontUserModel.test.js)
const TEST_USER_ID = 11
const TEST_USER_LOGIN = "test_user"
const TEST_USER_EMAIL = "test_user@gmail.com"
const TEST_USER_PASSWORD = "212007rf"

// Глобальный afterAll для закрытия соединения после всех тестов
afterAll(async () => {
    const knex = require("@/db")

    console.log("🧹 Очистка тестовых транзакций...")

    const deletedCount = await knex("transactions")
        .where({ user_id: TEST_USER_ID })
        .andWhere("created_at", ">=", knex.raw("DATE_SUB(NOW(), INTERVAL 1 HOUR)"))
        .delete()

    console.log(`✅ Удалено ${deletedCount} тестовых транзакций`)

    await knex.destroy()
})

describe("TransactionService - Deposit Creation", () => {
    let testUserSession = ""

    beforeAll(async () => {
        // Создаем сессию для тестового пользователя
        const token = crypto.randomBytes(16).toString("hex")
        await frontUsersModel.updateRememberTokenById(TEST_USER_ID, token)
        testUserSession = token

        // Убеждаемся, что пользователь имеет роль "user"
        await frontUsersModel.changeRole(TEST_USER_ID, "user")
    })

    afterAll(async () => {
        // Очищаем сессию
        await frontUsersModel.updateRememberTokenById(TEST_USER_ID, "")
    })

    describe("Successful deposit creation", () => {
        test("Should create USDT deposit with ERC20 network", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100.50,
                user_comment: "Test deposit"
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()
            expect(result.errors).toEqual([])

            // Проверяем созданную транзакцию
            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction).toBeDefined()
            expect(transaction.user_id).toBe(TEST_USER_ID)
            expect(transaction.type).toBe("deposit")
            expect(transaction.status).toBe("pending")
            expect(transaction.currency).toBe("USDT")
            expect(transaction.network).toBe("ERC20")
            expect(parseFloat(transaction.amount)).toBe(100.50)
            expect(transaction.is_manual).toBe(0) // MySQL boolean как 0/1
            expect(parseFloat(transaction.fee)).toBe(0)
            expect(transaction.user_comment).toBe("Test deposit")
        })

        test("Should create W_TOKEN deposit", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "W_TOKEN",
                network: "internal",
                amount: 50
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.currency).toBe("W_TOKEN")
            expect(parseFloat(transaction.amount)).toBe(50)
        })

        test("Should create deposit with all available USDT networks", async () => {
            const networks = ["ERC20", "TRC20", "BEP20", "Polygon", "Arbitrum"]

            for (const network of networks) {
                const depositData = {
                    userId: TEST_USER_ID,
                    session: testUserSession,
                    currency: "USDT",
                    network: network,
                    amount: 10
                }

                const result = await TransactionService.store(depositData)

                expect(result.status).toBe("ok")
                expect(result.errors).toEqual([])

                const transaction = await transactionsModel.findById(result.insertId)
                expect(transaction.network).toBe(network)
            }
        })

        test("Should create deposit with decimal amounts", async () => {
            const amounts = [0.01, 10.5, 100.99, 1000.123456]

            for (const amount of amounts) {
                const depositData = {
                    userId: TEST_USER_ID,
                    session: testUserSession,
                    currency: "USDT",
                    network: "ERC20",
                    amount: amount
                }

                const result = await TransactionService.store(depositData)

                expect(result.status).toBe("ok")

                const transaction = await transactionsModel.findById(result.insertId)
                expect(parseFloat(transaction.amount)).toBeCloseTo(amount, 6)
            }
        })
    })

    describe("Validation errors", () => {
        test("Should fail without userId", async () => {
            const depositData = {
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("userId не указан")
        })

        test("Should fail without session", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("session не указан")
        })

        test("Should fail with invalid session", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: "invalid_session_token_12345",
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Пользователь не авторизован")
        })

        test("Should fail without required currency field", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'currency' является обязательным")
        })

        test("Should fail without required network field", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'network' является обязательным")
        })

        test("Should fail without required amount field", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20"
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Поле 'amount' является обязательным")
        })

        test("Should fail with invalid currency", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "BTC",
                network: "BTC",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors.some(e => e.includes("Недопустимая валюта"))).toBe(true)
        })

        test("Should fail with invalid network for USDT", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "SOL",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors.some(e => e.includes("Недопустимая сеть"))).toBe(true)
        })

        test("Should fail with zero amount", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 0
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
        })

        test("Should fail with negative amount", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: -50
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
        })

        test("Should fail with non-numeric amount", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: "not a number"
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors).toContain("Неверное значение суммы 'amount'")
        })

        test("Should fail with empty string amount", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: ""
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors.some(e =>
                e.includes("amount") && (e.includes("обязательным") || e.includes("Неверное значение"))
            )).toBe(true)
        })
    })

    describe("Field trimming and normalization", () => {
        test("Should trim whitespace from string fields", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100,
                user_comment: "  Test comment with spaces  "
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.user_comment).toBe("Test comment with spaces")
        })

        test("Should handle string amount and convert to number", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: "123.45"
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(parseFloat(transaction.amount)).toBe(123.45)
        })
    })

    describe("Default values", () => {
        test("Should set correct default values for deposit", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
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

        test("Should set fee to 0 if not provided", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            const transaction = await transactionsModel.findById(result.insertId)
            expect(parseFloat(transaction.fee)).toBe(0)
        })

        test("Should have created_at timestamp", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.created_at).toBeDefined()
            expect(new Date(transaction.created_at)).toBeInstanceOf(Date)
        })
    })

    describe("Edge cases", () => {
        test("Should handle very small amounts", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 0.000001
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(parseFloat(transaction.amount)).toBeCloseTo(0.000001, 6)
        })

        test("Should handle very large amounts", async () => {
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 999999999.99
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(parseFloat(transaction.amount)).toBeCloseTo(999999999.99, 2)
        })

        test("Should handle user comment with special characters", async () => {
            const specialComment = "Test №123 with special chars: @#$%^&*()"
            const depositData = {
                userId: TEST_USER_ID,
                session: testUserSession,
                currency: "USDT",
                network: "ERC20",
                amount: 100,
                user_comment: specialComment
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("ok")

            const transaction = await transactionsModel.findById(result.insertId)
            expect(transaction.user_comment).toBe(specialComment)
        })
    })

    describe("Multiple deposits", () => {
        test("Should create multiple deposits for same user", async () => {
            const deposits = []

            for (let i = 0; i < 3; i++) {
                const depositData = {
                    userId: TEST_USER_ID,
                    session: testUserSession,
                    currency: "USDT",
                    network: "ERC20",
                    amount: 100 * (i + 1)
                }

                const result = await TransactionService.store(depositData)
                expect(result.status).toBe("ok")
                deposits.push(result.insertId)
            }

            expect(deposits.length).toBe(3)
            expect(new Set(deposits).size).toBe(3) // Все ID уникальны
        })
    })

    describe("Permission checks", () => {
        test("Should fail if user role is not 'user'", async () => {
            const originalRole = "user"

            // Меняем роль на candidate
            await frontUsersModel.changeRole(TEST_USER_ID, "candidate")

            // Создаем новую сессию для пользователя с новой ролью
            const newToken = crypto.randomBytes(16).toString("hex")
            await frontUsersModel.updateRememberTokenById(TEST_USER_ID, newToken)

            const depositData = {
                userId: TEST_USER_ID,
                session: newToken,
                currency: "USDT",
                network: "ERC20",
                amount: 100
            }

            const result = await TransactionService.store(depositData)

            expect(result.status).toBe("error")
            expect(result.errors.some(e =>
                e.includes("У вас нет прав") || e.includes("не авторизован")
            )).toBe(true)

            // Возвращаем роль и сессию обратно
            await frontUsersModel.changeRole(TEST_USER_ID, originalRole)
            await frontUsersModel.updateRememberTokenById(TEST_USER_ID, testUserSession)
        })
    })
})

describe("TransactionService - Query Operations", () => {
    let testTransactionIds = []
    let queryTestSession = ""

    beforeAll(async () => {
        // Создаем сессию для тестового пользователя
        const token = crypto.randomBytes(16).toString("hex")
        queryTestSession = token
        await frontUsersModel.updateRememberTokenById(TEST_USER_ID, token)
        await frontUsersModel.changeRole(TEST_USER_ID, "user")

        // Создаем несколько тестовых транзакций
        const depositData1 = {
            userId: TEST_USER_ID,
            session: token,
            currency: "USDT",
            network: "ERC20",
            amount: 500
        }

        const depositData2 = {
            userId: TEST_USER_ID,
            session: token,
            currency: "W_TOKEN",
            network: "internal",
            amount: 1000
        }

        const result1 = await TransactionService.store(depositData1)
        const result2 = await TransactionService.store(depositData2)

        testTransactionIds.push(result1.insertId, result2.insertId)
    })

    afterAll(async () => {
        // Очищаем сессию
        await frontUsersModel.updateRememberTokenById(TEST_USER_ID, "")
    })

    test("Should find transaction by ID", async () => {
        const transactionId = testTransactionIds[0]
        const transaction = await transactionsModel.findById(transactionId)

        expect(transaction).toBeDefined()
        expect(transaction.id).toBe(transactionId)
        expect(transaction.user_id).toBe(TEST_USER_ID)
    })

    test("Should find transactions by user", async () => {
        const transactions = await transactionsModel.findByUser(TEST_USER_ID)

        expect(Array.isArray(transactions)).toBe(true)
        expect(transactions.length).toBeGreaterThanOrEqual(2)
        expect(transactions.every(t => t.user_id === TEST_USER_ID)).toBe(true)
    })

    test("Should find transactions by status", async () => {
        const transactions = await transactionsModel.findByStatus("pending")

        expect(Array.isArray(transactions)).toBe(true)
        if (transactions.length > 0) {
            expect(transactions.every(t => t.status === "pending")).toBe(true)
        }
    })

    test("Should find transactions by multiple statuses", async () => {
        const transactions = await transactionsModel.findByStatus(["pending", "confirmed"])

        expect(Array.isArray(transactions)).toBe(true)
        if (transactions.length > 0) {
            expect(
                transactions.every(t => ["pending", "confirmed"].includes(t.status))
            ).toBe(true)
        }
    })

    test("Should order transactions by created_at DESC", async () => {
        const transactions = await transactionsModel.findByUser(TEST_USER_ID)

        if (transactions.length > 1) {
            for (let i = 0; i < transactions.length - 1; i++) {
                const current = new Date(transactions[i].created_at)
                const next = new Date(transactions[i + 1].created_at)
                expect(current >= next).toBe(true)
            }
        }
    })
})