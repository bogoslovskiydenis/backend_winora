require("module-alias/register")
require("@/config")

const knex = require("@/db")
const loggerBalanceChanges = require("@/models/LoggerBalanceChanges")

describe("LoggerBalanceChanges model", () => {
    let insertedId

    afterAll(async () => {
        if (insertedId) {
            await knex("balance_changes").where({ id: insertedId }).del()
        }
    })

    test("insert возвращает id вставленной записи", async () => {
        const data = {
            user_id: 11,
            currency: "USDT",
            operation: "deposit",
            amount: 100,
            change_source: "admin",
            changed_by_admin_id: 1
        }

        insertedId = await loggerBalanceChanges.insert(data)

        expect(typeof insertedId).toBe("number")

        const row = await knex("balance_changes").where({ id: insertedId }).first()
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


