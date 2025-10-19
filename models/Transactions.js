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

  async findByStatus(statuses) {
    try {
      if (!Array.isArray(statuses)) {
        statuses = [statuses]
      }
      return knex(this.#table)
        .whereIn("status", statuses)
        .orderBy("created_at", "desc")
    } catch (error) {
      console.error("Ошибка при поиске транзакций по статусу:", error.message)
      throw error
    }
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
