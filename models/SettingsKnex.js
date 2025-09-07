const knex = require("@/db")

class SettingsModelKnex {
  #mainTable
  #defaultLang

  constructor(schema) {
    this.schema = schema
    this.#mainTable = schema.tableName
    this.#defaultLang = 1
  }

  async getPosts(lang = this.#defaultLang) {
    const data = await knex(this.#mainTable).where({ lang }).select()
    return data || []
  }

  async indexAdmin(lang = this.#defaultLang) {
    const data = await knex(this.#mainTable).where({ lang }).select()
    return data || []
  }

  async getPostById(id) {
    const data = await knex(this.#mainTable).select().where({ id }).first()
    return data || undefined
  }

  async update(data, id) {
    return knex(this.#mainTable).where({ id }).update(data)
  }

  async getPostByKey(key, lang) {
    const data = await knex(this.#mainTable)
      .select()
      .where({ key_id: key, lang })
      .first()
    return data || undefined
  }
}
module.exports = SettingsModelKnex
