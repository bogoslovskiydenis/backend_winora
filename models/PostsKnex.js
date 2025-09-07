const knex = require("@/db")
const CategoryModel = require("@/models/CategoryKnex")
const RelativeModel = require("@/models/RelativeKnex")
const Helper = require("@/helpers")

class PostsModelKnex {
  #mainTable
  #metaTable
  #defaultLimit
  #defaultOffset
  #orderBy
  #orderKey
  #defaultLang
  #relatives
  #relativeModel

  constructor(schema) {
    this.schema = schema
    this.#mainTable = schema.tableName
    this.#metaTable = schema.metaFields.tableName
    this.#defaultLimit = 8
    this.#defaultOffset = 0
    this.#orderBy = schema.orderBy
    this.#orderKey = "DESC"
    this.#defaultLang = 1
    this.#relatives = Object.keys(this.schema.relatives)
    this.#relativeModel = new RelativeModel(schema)
  }

  async getPublicPosts(settings) {
    const { limit, offset, orderBy, orderKey, lang } =
      this.validateSettings(settings)
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang, status: "public" })
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getPublicRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async getPublicPostsWithOutIds(settings) {
    const { limit, offset, orderBy, orderKey, lang, exclude } =
      this.validateSettings(settings)
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang, status: "public" })
      .whereNotIn("id", exclude)
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)

    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async getPublicPostByUrl(url) {
    let data = await knex(this.#mainTable)
      .select()
      .where({
        [`${this.#mainTable}.permalink`]: url,
        status: "public"
      })
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .first()
    if (data) {
      const relative = await this.getPublicRelativesById(data.id)
      data = { ...data, ...relative }
      return data
    }
    return data
  }

  async insert(commonData, metaData) {
    const insertId = await knex(this.#mainTable).insert(commonData)
    await knex(this.#metaTable).insert({ ...metaData, post_id: insertId })
    return insertId
  }

  async getTotalCountPublicByLang(lang) {
    const result = await knex(this.#mainTable)
      .where({ lang, status: "public" })
      .count("id")
    return result[0]["count(`id`)"]
  }

  async getPostById(id) {
    let data = await knex(this.#mainTable)
      .select()
      .where({ [`${this.#mainTable}.id`]: id })
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .first()
    if (data) {
      const relative = await this.getRelativesById(id)
      data = { ...data, ...relative }
      return data
    }
    return data
  }

  async updateById(id, data) {
    return knex(this.#mainTable).where({ id }).update(data)
  }

  async getByPermalink(url) {
    return knex(this.#mainTable)
      .select()
      .where({
        [`${this.#mainTable}.permalink`]: url
      })
      .first()
  }

  async getPosts(settings) {
    const localSettings = {
      ...settings,
      orderBy: "created_at",
      orderKey: "DESC"
    }
    const { limit, offset, orderBy, orderKey, lang } =
      this.validateSettings(localSettings)
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang })
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy, orderKey)
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async getTotalCountByLang(lang) {
    const result = await knex(this.#mainTable).where({ lang }).count("id")
    return result[0]["count(`id`)"]
  }

  async updateMetaById(id, data) {
    return knex(this.#metaTable).where({ post_id: id }).update(data)
  }

  async searchByTitle(lang, str) {
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang })
      .whereILike("title", `%${str}%`)
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async searchPublicByTitle(lang, str) {
    const data = await knex(this.#mainTable)
      .select()
      .where({ lang, status: "public" })
      .whereILike("title", `%${str}%`)
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async getPublicPostsByArrId(arr, settings) {
    const orderBy = Helper.validateOrderBy(settings.orderBy, this.schema)
    const limit = Helper.validateLimits(settings.limit, this.#defaultLimit)
    const orderKey = Helper.validateOrderKey(settings.orderKey)
    const offset = Helper.validateOffset(settings.offset)
    const data = await knex(this.#mainTable)
      .select()
      .where({ status: "public" })
      .whereIn("id", arr)
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .orderBy(orderBy, orderKey)
      .offset(offset)
      .limit(limit)
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getPublicRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async getPostsByArrId(arr) {
    const data = await knex(this.#mainTable)
      .select()
      .whereIn("id", arr)
      .join(
        this.#metaTable,
        `${this.#mainTable}.id`,
        "=",
        `${this.#metaTable}.post_id`
      )
      .orderBy(this.#orderBy, this.#orderKey)
    if (data) {
      for (const [index, post] of data.entries()) {
        const relative = await this.getRelativesById(post.id)
        data[index] = { ...data[index], ...relative }
      }
      return data
    }
    return []
  }

  async deleteById(id) {
    return knex(this.#mainTable).where({ id }).del()
  }

  async getRelativesById(id) {
    const data = {}
    const objRelatives = {}
    for await (const relative of this.#relatives) {
      objRelatives[relative] = await this.#relativeModel.getRelativeByPostId(
        id,
        relative
      )
    }
    for await (const key of Object.keys(objRelatives)) {
      const relativeSchema = require(
        `./../schemas/${this.schema.relatives[key].relativeSchema}`
      )
      /* prettier-ignore */
      const model = key === "category" ? new CategoryModel(relativeSchema) : new PostsModelKnex(relativeSchema);
      data[key] = await model.getPostsByArrId(objRelatives[key])
    }
    return data
  }

  async getPublicRelativesById(id) {
    const data = {}
    const objRelatives = {}
    for await (const relative of this.#relatives) {
      objRelatives[relative] = await this.#relativeModel.getRelativeByPostId(
        id,
        relative
      )
    }
    for await (const key of Object.keys(objRelatives)) {
      const relativeSchema = require(
        `./../schemas/${this.schema.relatives[key].relativeSchema}`
      )
      /* prettier-ignore */
      const model = key === "category" ? new CategoryModel(relativeSchema) : new PostsModelKnex(relativeSchema);
      data[key] = await model.getPublicPostsByArrId(objRelatives[key], {})
    }
    return data
  }

  validateSettings(settings) {
    return {
      limit: "limit" in settings ? settings.limit : this.#defaultLimit,
      offset: "offset" in settings ? settings.offset : this.#defaultOffset,
      orderBy: "orderBy" in settings ? settings.orderBy : this.#orderBy,
      orderKey: "orderKey" in settings ? settings.orderKey : this.#orderKey,
      lang: "lang" in settings ? settings.lang : this.#defaultLang,
      exclude: "exclude" in settings ? settings.exclude : []
    }
  }

  async getAllPostsByLang(lang) {
    return knex(this.#mainTable).where({ lang })
  }

  async getByArrTitles(titles, lang) {
    if (!titles.length) {
      return []
    }
    return (
      (await knex(this.#mainTable)
        .select()
        .where({ lang })
        .whereIn("title", titles)) || []
    )
  }

  async getTotalPublicPostsByArrId(arr) {
    const result = await knex(this.#mainTable)
      .select()
      .where({ status: "public" })
      .whereIn("id", arr)
      .count("id")
    return result[0]["count(`id`)"]
  }
}
module.exports = PostsModelKnex
