const knex = require("@/db")
class LoggerInvestmentChanges {
    #table
    constructor() {
        this.#table = "investment_edits"
    }
    async insert(data) {
        const [id] = await knex(this.#table).insert(data)
        return id
    }
}
module.exports = new LoggerInvestmentChanges()

