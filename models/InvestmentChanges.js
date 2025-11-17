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

    async getDistinctFieldsByInvestmentId(investmentId) {
        const rows = await knex(this.#table)
            .distinct("field")
            .where({ investment_id: investmentId })
        return rows.map((r) => r.field)
    }

    async getChangesByInvestmentId(investmentId) {
        return knex(this.#table)
            .select(
                "transaction_id",
                "investment_id",
                "changed_by_admin_id",
                "changed_by_user_id",
                "edited_at",
                "field",
                "old_value",
                "new_value",
                "change_source"
            )
            .where({ investment_id: investmentId })
            .orderBy("edited_at", "desc")
    }

    async getChangesWithFiltersByInvestmentId(
        investmentId,
        { change_source, field, periodFrom, periodTo } = {}
    ) {
        let query = knex(this.#table)
            .select(
                "transaction_id",
                "investment_id",
                "changed_by_admin_id",
                "changed_by_user_id",
                "edited_at",
                "field",
                "old_value",
                "new_value",
                "change_source"
            )
            .where({ investment_id: investmentId })

        if (change_source) {
            query = query.andWhere({ change_source })
        }
        if (field) {
            query = query.andWhere("field", field)
        }
        if (periodFrom) {
            query = query.andWhere("edited_at", ">=", periodFrom)
        }
        if (periodTo) {
            query = query.andWhere("edited_at", "<=", periodTo)
        }

        return query.orderBy("edited_at", "desc")
    }
}

module.exports = InvestmentChanges

