require("module-alias/register")
require("@/config")
const TransactionService = require("@/app/transactions/service")
const FrontUsersModel = require("@/models/FrontUsers")
const crypto = require("crypto")

const frontUsersModel = new FrontUsersModel()
const testUserId = 11

describe("TransactionService", () => {
    let testSession = null
    let createdTransactionIds = []

    beforeAll(async () => {
        const token = crypto.randomBytes(16).toString("hex")
        await frontUsersModel.updateRememberTokenById(testUserId, token)
        testSession = token
    })

    afterAll(async () => {
        await frontUsersModel.updateRememberTokenById(testUserId, "")

        if (createdTransactionIds.length > 0) {
            const knex = require("@/db")
            await knex("transactions").whereIn("id", createdTransactionIds).del()
        }

        await frontUsersModel.destroy()
    })

    describe("Store deposit transaction", () => {
        test("Should successfully create deposit transaction with valid data", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()
            expect(typeof result.insertId).toBe("number")
            expect(result.errors).toEqual([])

            createdTransactionIds.push(result.insertId)
        })

        test("Should fail without userId", async () => {
            const transactionData = {
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors.some((e) => e.includes("userId"))).toBe(true)
        })

        test("Should fail without session", async () => {
            const transactionData = {
                userId: testUserId,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.some((e) => e.includes("session"))).toBe(true)
        })

        test("Should fail with invalid session", async () => {
            const transactionData = {
                userId: testUserId,
                session: "invalid_session",
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.some((e) => e.includes("авторизован"))).toBe(true)
        })

        test("Should set default type to deposit if not provided", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()

            createdTransactionIds.push(result.insertId)
        })

        test("Should fail without required field: currency", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.some((err) => err.includes("'currency'"))).toBe(true)
        })

        test("Should fail without required field: network", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.some((err) => err.includes("'network'"))).toBe(true)
        })

        test("Should fail without required field: amount", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(result.errors.some((err) => err.includes("'amount'"))).toBe(true)
        })

        test("Should override invalid transaction type to deposit (handler behavior)", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "invalid_type",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()

            createdTransactionIds.push(result.insertId)
        })

        test("Should fail with invalid amount (zero)", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 0
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(
                result.errors.some((err) => err.includes("Неверное значение суммы"))
            ).toBe(true)
        })

        test("Should fail with negative amount", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: -100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(
                result.errors.some((err) => err.includes("Неверное значение суммы"))
            ).toBe(true)
        })

        test("Should fail with invalid currency", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "INVALID_CURRENCY",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(
                result.errors.some((err) => err.includes("Недопустимая валюта"))
            ).toBe(true)
        })

        test("Should fail with invalid network for currency", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "INVALID_NETWORK",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(
                result.errors.some((err) => err.includes("Недопустимая сеть"))
            ).toBe(true)
        })

        test("Should trim whitespace from string fields", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "  USDT  ",
                network: "  TRC20  ",
                amount: 100,
                from_address: "  sender_address  ",
                to_address: "  recipient_address  ",
                user_comment: "  test comment  "
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()

            const knex = require("@/db")
            const transaction = await knex("transactions")
                .where({ id: result.insertId })
                .first()

            expect(transaction.currency).toBe("USDT")
            expect(transaction.network).toBe("TRC20")
            expect(transaction.from_address).toBe("sender_address")
            expect(transaction.to_address).toBe("recipient_address")

            createdTransactionIds.push(result.insertId)
        })

        test("Should set default values correctly", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            const knex = require("@/db")
            const transaction = await knex("transactions")
                .where({ id: result.insertId })
                .first()

            expect(transaction.status).toBe("pending")
            expect(transaction.type).toBe("deposit")
            expect(transaction.is_manual).toBe(0)
            expect(parseFloat(transaction.fee)).toBe(0)
            expect(transaction.tx_hash).toBe(null)
            expect(transaction.from_address).toBe("")
            expect(transaction.to_address).toBe("")

            createdTransactionIds.push(result.insertId)
        })

        test("Should handle W_TOKEN currency without network validation", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "W_TOKEN",
                network: "INTERNAL",
                amount: 50
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")
            expect(result.insertId).toBeDefined()

            createdTransactionIds.push(result.insertId)
        })
    })

    describe("Different transaction types", () => {
        test("Should create withdrawal transaction", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "withdrawal",
                currency: "USDT",
                network: "TRC20",
                amount: 50
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            createdTransactionIds.push(result.insertId)
        })

        test("Should create transfer transaction", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "transfer",
                currency: "USDT",
                network: "TRC20",
                amount: 25
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            createdTransactionIds.push(result.insertId)
        })
    })

    describe("Transaction with optional fields", () => {
        test("Should create transaction with fee", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: 2.5
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            const knex = require("@/db")
            const transaction = await knex("transactions")
                .where({ id: result.insertId })
                .first()

            expect(parseFloat(transaction.fee)).toBeCloseTo(2.5, 2)

            createdTransactionIds.push(result.insertId)
        })

        test("Should fail with negative fee", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                fee: -1
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("error")
            expect(
                result.errors.some((err) => err.includes("Неверное значение комиссии"))
            ).toBe(true)
        })

        test("Should create transaction with addresses", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                from_address: "sender_wallet_address",
                to_address: "recipient_wallet_address"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            createdTransactionIds.push(result.insertId)
        })

        test("Should create transaction with comments", async () => {
            const transactionData = {
                userId: testUserId,
                session: testSession,
                type: "deposit",
                currency: "USDT",
                network: "TRC20",
                amount: 100,
                internal_comment: "Admin note",
                user_comment: "User deposit note"
            }

            const result = await TransactionService.store(transactionData)

            expect(result.status).toBe("ok")

            createdTransactionIds.push(result.insertId)
        })
    })

    describe("Multiple currencies and networks", () => {
        const testCases = [
            { currency: "USDT", network: "TRC20" },
            { currency: "USDT", network: "ERC20" },
            { currency: "USDT", network: "BEP20" },
            { currency: "W_TOKEN", network: "INTERNAL" }
        ]

        testCases.forEach(({ currency, network }) => {
            test(`Should create transaction with ${currency} on ${network}`, async () => {
                const transactionData = {
                    userId: testUserId,
                    session: testSession,
                    type: "deposit",
                    currency: currency,
                    network: network,
                    amount: 100
                }

                const result = await TransactionService.store(transactionData)

                expect(result.status).toBe("ok")
                expect(result.insertId).toBeDefined()

                createdTransactionIds.push(result.insertId)
            })
        })
    })
})