const knex = require("@/db")

class RelativeModelKnex {
  constructor(schema) {
    this.schema = schema
  }

  async getRelativeByPostId(id, relativeType) {
    const table = this.schema.relatives[relativeType].tableName
    const result = await knex(table).select().where({ post_id: id })
    return result.length ? result.map((item) => item.relative_id) : []
  }

  async getPostIdByRelative(id, relativeType) {
    const table = this.schema.relatives[relativeType].tableName
    const result = await knex(table).select().where({ relative_id: id })
    return result.length ? result.map((item) => item.post_id) : []
  }

  async insert(postId, relativeType, relativeId) {
    const table = this.schema.relatives[relativeType].tableName
    await knex(table).insert({ post_id: postId, relative_id: relativeId })
  }

  async delete(id, relativeType) {
    const table = this.schema.relatives[relativeType].tableName
    await knex(table).where({ post_id: id }).del()
  }

  async update(postId, relativeType, relativeIds = []) {
    await this.delete(postId, relativeType)
    for await (const id of relativeIds) {
      await this.insert(postId, relativeType, id)
    }
  }
}
module.exports = RelativeModelKnex
