const knex = require("@/db")
class OptionsModelKnex {
  #table
  constructor(table) {
    this.#table = table
  }
  async insert(data) {
    const insertId = await knex(this.#table).insert(data)
    return insertId
  }
  async fetch() {
    return await knex(this.#table).select()
  }
  async whereNull(field) {
    return await knex(this.#table).whereNull(field)
  }
  async updateByUrl(data) {
    await knex(this.#table).where("url", "=", data.url).update(data)
  }
  async selectByKey(key, value) {
    return await knex(this.#table).where({
      [key]: value
    })
  }
  async update(whereObj, data) {
    return await knex(this.#table).where(whereObj).update(data)
  }
  async deleteByUrl(url) {
    return await knex(this.#table).where({ url }).delete()
  }
}
module.exports = OptionsModelKnex
