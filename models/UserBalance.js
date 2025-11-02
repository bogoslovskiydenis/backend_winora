const knex = require("@/db")
class UserBalanceModel {
  #table
  constructor() {
    this.#table = "users_balance"
  }
  async insert(data) {
    try {
      if (!data || !data.user_id || !data.currency) {
        throw new Error("Необходимо указать user_id и currency")
      }
      const insertData = {
        user_id: data.user_id,
        currency: data.currency,
        balance: data.balance ?? 0,
        locked_balance: data.locked_balance ?? 0
      }
      await knex(this.#table).insert(insertData)
    } catch (error) {
      console.error("Ошибка при вставке баланса:", error.message)
      throw error
    }
  }

  async updateByUserId(userId, data, currency = "USDT") {
    await knex(this.#table).where({ user_id: userId, currency }).update(data)
    return knex(this.#table).where({ user_id: userId, currency }).first()
  }

  async findByUserId(userId, currency = "USDT") {
    return await knex(this.#table).where({ user_id: userId, currency }).first()
  }
  async destroy() {
    await knex.destroy()
  }
}
module.exports = new UserBalanceModel()
