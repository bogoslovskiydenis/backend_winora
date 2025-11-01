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

  async findByUser(userId, settings) {
    const { offset = 0, limit = 20 } = settings
    return knex(this.#table)
      .where({ user_id: userId })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
  }

  async findByStatuses(settings) {
    const { statuses, offset, limit } = settings
    return knex(this.#table)
      .whereIn("status", statuses)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
  }

  async findByTypes(settings) {
    const { types, offset, limit } = settings
    return knex(this.#table)
      .whereIn("type", types)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
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

  async totalByStatuses(statuses) {
    const result = await knex(this.#table)
      .whereIn("status", statuses)
      .count({ total: "id" })
      .first()

    return Number(result?.total ?? 0)
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

  async totalByTypes(types) {
    const result = await knex(this.#table)
      .whereIn("type", types)
      .count({ total: "id" })
      .first()

    return Number(result?.total) || 0
  }

  async getPostById(id) {
    return knex(this.#table).where({ id }).first()
  }

  async getPostByUserIdTransactionId(user_id, transactionId) {
    return knex(this.#table).where({ user_id, id: transactionId }).first()
  }

  async updateById(id, data) {
    return knex(this.#table).where({ id: id }).update(data)
  }
}

module.exports = new TransactionsModel()
