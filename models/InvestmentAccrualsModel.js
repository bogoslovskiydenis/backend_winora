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
}

module.exports = new InvestmentAccrualsModel()
