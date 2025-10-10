const knex = require("@/db")
const mainSchema = require("@/schemas/page")
class PageModelKnex {
  #mainTable
  #defaultLimit
  #defaultOffset
  #orderBy
  #orderKey
  #defaultLang
  constructor(schema) {
    this.schema = schema
    this.#mainTable = schema.tableName
    this.#defaultLimit = 8
    this.#defaultOffset = 0
    this.#orderBy = schema.orderBy
    this.#orderKey = "DESC"
    this.#defaultLang = 1
  }
  async getPublicPosts(settings) {
    const { limit, offset, orderBy, orderKey, lang } =
      this.validateSettings(settings)
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang: lang, status: "public" })
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
    return data ? data : []
  }
  async getPublicPostByUrl(url) {
    let data = await knex(this.#mainTable)
      .select()
      .where({
        permalink: url,
        status: "public"
      })
      .first()
    return data ? data : undefined
  }
  async getPosts(settings) {
    const { limit, offset, orderBy, orderKey, lang } =
      this.validateSettings(settings)
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang })
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
    return data ? data : []
  }
  async getTotalCountByLang(lang = this.#defaultLang) {
    const result = await knex(this.#mainTable).where({ lang }).count("id")
    return result[0]["count(`id`)"]
  }
  async getPostById(id) {
    let data = await knex(this.#mainTable).select().where({ id }).first()
    return data ? data : undefined
  }
  async updateById(id, data) {
    return knex(this.#mainTable).where({ id: id }).update(data)
  }
  async getAllPostsByLang(lang) {
    return knex(this.#mainTable).where({ lang })
  }
  validateSettings(settings) {
    return {
      limit:
        "limit" in settings && settings.limit
          ? settings.limit
          : this.#defaultLimit,
      offset:
        "offset" in settings && settings.limit
          ? settings.offset
          : this.#defaultOffset,
      orderBy:
        "orderBy" in settings && settings.orderBy
          ? settings.orderBy
          : this.#orderBy,
      orderKey:
        "orderKey" in settings && settings.orderKey
          ? settings.orderKey
          : this.#orderKey,
      lang:
        "lang" in settings && settings.lang ? settings.lang : this.#defaultLang,
      exclude: "exclude" in settings && settings.exclude ? settings.exclude : []
    }
  }
}
module.exports = new PageModelKnex(mainSchema)
