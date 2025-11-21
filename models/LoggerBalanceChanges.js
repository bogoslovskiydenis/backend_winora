const knex = require("@/db")

class LoggerBalanceChanges {
    #table
    constructor() {
        this.#table = "balance_changes"
    }

    async insert(data) {
        const [id] = await knex(this.#table).insert(data)
        return id
    }
}

module.exports = new LoggerBalanceChanges()


