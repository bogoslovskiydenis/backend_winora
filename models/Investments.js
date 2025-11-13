const knex = require("@/db")
const schema = require("@/schemas/investments")

class InvestmentsModel {
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

  async insert(data) {
    const [insertId] = await knex(this.#table).insert(data)
    return insertId
  }

  async findByStatuses(settings) {
    const { statuses, offset, limit } = settings
    return knex(this.#table)
      .whereIn("status", statuses)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
  }

  async totalByStatuses(statuses) {
    const result = await knex(this.#table)
      .whereIn("status", statuses)
      .count({ total: "id" })
      .first()

    return Number(result?.total ?? 0)
  }

  async getUserPostsByStatus(user_id, settings = {}) {
    const {
      statuses = [],
      offset = 0,
      limit = 20,
      dateFrom,
      dateTo,
      order = "desc"
    } = settings

    const query = knex(this.#table)
      .where({ user_id })
      .whereIn("status", statuses)
      .orderBy("created_at", order)
      .limit(limit)
      .offset(offset)

    if (dateFrom) {
      query.andWhere("created_at", ">=", dateFrom)
    }
    if (dateTo) {
      query.andWhere("created_at", "<=", dateTo)
    }

    return query
  }

  async totalPostsUserByStatuses(userId, settings) {
    const { statuses = [], dateFrom = null, dateTo = null } = settings

    const query = knex(this.#table)
      .where({ user_id: userId })
      .whereIn("status", statuses)

    if (dateFrom) {
      query.andWhere("created_at", ">=", dateFrom)
    }

    if (dateTo) {
      query.andWhere("created_at", "<=", dateTo)
    }

    const result = await query.count({ total: "id" }).first()

    return Number(result?.total) || 0
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

  async getPostById(id) {
    return knex(this.#table).select().where({ id }).first()
  }
  async destroy() {
    await knex.destroy()
  }
}
module.exports = new InvestmentsModel(schema)
