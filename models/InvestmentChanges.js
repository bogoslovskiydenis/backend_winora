const knex = require("@/db")

class InvestmentChanges {
    #table
    constructor() {
        this.#table = "investment_edits"
    }

    async getDistinctAdminIdByInvestmentId(investmentId) {
        const rows = await knex(this.#table)
            .distinct("changed_by_admin_id")
            .where({ investment_id: investmentId })
            .whereNotNull("changed_by_admin_id")
        return rows.map((r) => r.changed_by_admin_id)
    }
}

module.exports = new InvestmentChanges()

