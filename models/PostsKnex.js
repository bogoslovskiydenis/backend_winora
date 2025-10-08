const knex = require("@/db")

class PostsModel {
  #table
  #orderBy
  #orderKey
  #defaultLimit
  #defaultOffset
  constructor(schema) {
    if (!schema?.tableName) {
      throw new Error("Schema must contain a valid tableName")
    }

    this.#table = schema.tableName
    this.#orderBy = schema.orderBy || "id"
    this.#orderKey = schema.orderKey || "DESC"
    this.#defaultLimit = schema.defaultLimit || 8
    this.#defaultOffset = schema.defaultOffset || 0
  }
  async getPublicPostById(id) {
    return knex(this.#table).select().where({ status: "public", id }).first()
  }

  async getPostById(id) {
    return knex(this.#table).select().where({ id }).first()
  }

  async getPublicPosts(settings) {
    const { limit, offset, orderBy, orderKey } = this.validateSettings(settings)
    return knex(this.#table)
      .select()
      .where({ status: "public" })
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
  }

  async getPosts(settings) {
    const { limit, offset, orderBy, orderKey } = this.validateSettings(settings)
    return knex(this.#table)
      .select()
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
  }

  async getTotalCount() {
    const [result] = await knex(this.#table).count("id")
    return result["count(`id`)"]
  }

  async getTotalPublicCount() {
    const [result] = await knex(this.#table)
      .where({ status: "public" })
      .count("id")
    return result["count(`id`)"]
  }

  async insert(data) {
    const [insertId] = await knex(this.#table).insert(data)
    return insertId
  }

  async updateById(id, data) {
    return knex(this.#table).where({ id: id }).update(data)
  }

  async deleteById(id) {
    return knex(this.#table).where({ id }).del()
  }

  validateSettings(settings) {
    return {
      limit: "limit" in settings ? settings.limit : this.#defaultLimit,
      offset: "offset" in settings ? settings.offset : this.#defaultOffset,
      orderBy: "orderBy" in settings ? settings.orderBy : this.#orderBy,
      orderKey: "orderKey" in settings ? settings.orderKey : this.#orderKey,
      exclude: "exclude" in settings ? settings.exclude : []
    }
  }

  async destroy() {
    await knex.destroy()
  }
}
module.exports = PostsModel
