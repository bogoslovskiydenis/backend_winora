const knex = require("@/db")

class OptionsModelKnex {
  #mainTable

  constructor(schema) {
    this.schema = schema
    this.#mainTable = schema.tableName
  }

  async getPosts() {
    const data = await knex(this.#mainTable).select()
    return data || []
  }

  async getPostById(id) {
    return knex(this.#mainTable).select().where({ id }).first()
  }

  async update(data, id) {
    return knex(this.#mainTable).where({ id }).update(data)
  }
}
module.exports = OptionsModelKnex
