const knex = require("@/db")

class TransactionsModel {
  #table

  constructor() {
    this.#table = "transactions"
  }

  async store(data) {
    try {
      const [id] = await knex(this.#table).insert(data)
      return knex(this.#table).where({ id }).first()
    } catch (error) {
      console.error("Ошибка при создании транзакции:", error.message)
      throw error
    }
  }

  async findByUser(userId) {
    try {
      return knex(this.#table)
        .where({ user_id: userId })
        .orderBy("created_at", "desc")
    } catch (error) {
      console.error("Ошибка при поиске транзакций пользователя:", error.message)
      throw error
    }
  }

  async findByStatus(settings) {
    const { url, offset, limit } = settings
    return knex(this.#table)
      .where("status", url)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
  }

  async totalByStatus(status) {
    const [result] = await knex(this.#table)
      .where({ status })
      .count({ total: "id" })

    return Number(result?.total ?? 0)
  }

  async findById(id) {
    try {
      return knex(this.#table).where({ id }).first()
    } catch (error) {
      console.error("Ошибка при поиске транзакции по ID:", error.message)
      throw error
    }
  }

  async updateStatus(txId, status) {
    try {
      return knex(this.#table).where({ id: txId }).update({ status })
    } catch (error) {
      console.error("Ошибка при обновлении статуса транзакции:", error.message)
      throw error
    }
  }
}

module.exports = new TransactionsModel()
