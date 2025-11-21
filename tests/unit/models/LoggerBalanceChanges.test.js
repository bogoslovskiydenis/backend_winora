require("module-alias/register")
require("@/config")

const knex = require("@/db")
const loggerBalanceChanges = require("@/models/LoggerBalanceChanges")

describe("LoggerBalanceChanges model", () => {
    test("insert возвращает id вставленной записи", async () => {
        const data = {
            user_id: 11,
            currency: "USDT",
            operation: "deposit",
            amount: 100,
            change_source: "admin",
            changed_by_admin_id: 1
        }

        const id = await loggerBalanceChanges.insert(data)

        expect(typeof id).toBe("number")

        const row = await knex("balance_changes").where({ id }).first()
        expect(row).toMatchObject({
            user_id: 11,
            currency: "USDT",
            operation: "deposit",
            amount: expect.anything(),
            change_source: "admin",
            changed_by_admin_id: 1
        })
    })
})


