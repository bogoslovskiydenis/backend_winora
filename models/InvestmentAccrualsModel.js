const knex = require("@/db")
const schema = require("@/schemas/investment_accruals")

class InvestmentAccrualsModel {
  #table = schema.tableName

  async insertMany(rows) {
    return knex(this.#table).insert(rows)
  }

  async getForInvestment(investment_id) {
    return knex(this.#table)
      .where({ investment_id })
      .orderBy("accrued_at", "desc")
  }

  async getTotalAccruedByInvestmentIds(investmentIds) {
    return knex(this.#table)
      .select("investment_id")
      .sum("amount_usd as total_accrued")
      .whereIn("investment_id", investmentIds)
      .groupBy("investment_id")
  }
}

module.exports = new InvestmentAccrualsModel()
