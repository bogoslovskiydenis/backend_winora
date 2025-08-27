const Helper = require("../helpers")
const PostModel = require("../models/PostsKnex")
const RelativeModel = require("../models/RelativeKnex")
const CategoryModel = require("../models/CategoryKnex")
class BaseService {
  constructor(mainSchema) {
    this.schema = mainSchema
  }
  async getPublicPostByUrl(url) {
    const postModel = new PostModel(this.schema)
    const post = await postModel.getPublicPostByUrl(url)
    if (post) {
      this.schema.metaFields.fields.forEach((item) => {
        const [key] = item.params
        if (item.json) {
          const isValidJson = Helper.isJsonString(post[key])
          post[key] = isValidJson ? JSON.parse(post[key]) : item.default
        }
      })
      const relativesPosts = Object.keys(this.schema.relatives).filter(
        (item) => item !== "category"
      )
      relativesPosts.forEach((item) => {
        const { relativeTable } = this.schema.relatives[item]
        post[item].forEach((currentPost) => {
          relativeTable.metaFields.fields.forEach((field) => {
            const [key] = field.params
            if (field.json) {
              const isValidJson = Helper.isJsonString(currentPost[key])
              currentPost[key] = isValidJson
                ? JSON.parse(currentPost[key])
                : field.default
            }
          })
        })
      })
      post.content = Helper.textDecode(post.content)
    }
    return post
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0,
      lang: _LANG[settings.lang]
    }
    const MainModel = new PostModel(this.schema)
    response.body = await MainModel.getPosts(settings)
    response.total = await MainModel.getTotalCountByLang(settings.lang)
    return response
  }
  async getPostById(id) {
    const postModel = new PostModel(this.schema)
    const categoryModel = new CategoryModel(this.schema)
    const relativeModel = new RelativeModel(this.schema)
    const post = await postModel.getPostById(id)
    this.schema.metaFields.fields.forEach((item) => {
      const [key] = item.params
      if (item.json) {
        const isValidJson = Helper.isJsonString(post[key])
        post[key] = isValidJson ? JSON.parse(post[key]) : item.default
      }
    })
    const allCategory = await categoryModel.getAllPostsByLang(post.lang)
    post.category = {
      all_value: allCategory.map((item) => item.title),
      current_value: post.category.map((item) => item.title)
    }
    const relatives = Object.keys(this.schema.relatives).filter(
      (item) => item !== "category"
    )
    for await (const item of relatives) {
      const key = this.schema.relatives[item].tableName
      post[key] = {}
      post[key].current_value = []
      const ids = await relativeModel.getRelativeByPostId(post.id, item)
      const modelRelative = new PostModel(
        this.schema.relatives[item].relativeTable
      )
      const allPosts = await modelRelative.getAllPostsByLang(post.lang)
      post[key].all_value = allPosts.map((item) => item.title)
      if (ids.length) {
        const posts = await modelRelative.getPostsByArrId(ids)
        post[key].current_value = posts.map((item) => item.title)
      }
    }
    return post
  }
  async dataValidateInsert(data) {
    const newData = this.dataValidate(data)
    newData.lang = _LANG_ID[data.lang] ? _LANG_ID[data.lang] : _LANG_ID.ru
    newData.permalink = Helper.transliterateUrl(data.title)
    const postModel = new PostModel(this.schema)
    const candidate = await postModel.getByPermalink(newData.permalink)
    if (candidate) {
      let counter = 0
      do {
        counter++
        let newPermalink = `${newData.permalink}-${counter}`
        const newCandidate = await postModel.getByPermalink(newPermalink)
        if (!newCandidate) {
          newData.permalink = newPermalink
          break
        }
      } while (true)
    }
    return newData
  }
  dataValidate(data) {
    const newData = {}
    newData.title = data.title || ""
    newData.status = data.status || "hide"
    if (data.created_at) newData.created_at = data.created_at
    if (data.updated_at) newData.updated_at = data.updated_at
    newData.content = data.content || ""
    newData.description = data.description || ""
    newData.h1 = data.h1 || ""
    newData.keywords = data.keywords || ""
    newData.meta_title = data.meta_title || ""
    newData.short_desc = data.short_desc || ""
    newData.thumbnail = data.thumbnail || _THUMBNAIL
    if (data.post_type) newData.post_type = data.post_type
    if (data.slug) newData.slug = data.slug
    return newData
  }
  async dataValidateSave(data, schema) {
    const newData = this.dataValidate(data)
    newData.permalink = Helper.transliterateUrl(data.permalink)
    const postModel = new PostModel(schema)
    const candidate = await postModel.getByPermalink(newData.permalink)
    if (candidate && candidate.id !== data.id) {
      let counter = 0
      do {
        counter++
        let newPermalink = `${newData.permalink}-${counter}`
        const newCandidate = await postModel.getByPermalink(newPermalink)
        if (!newCandidate) {
          newData.permalink = newPermalink
          break
        }
      } while (true)
    }
    return newData
  }
  dataValidateMetaSave(data, fields) {
    const metaValue = {}
    fields.forEach((item) => {
      const [key] = item.params
      const value = data[key] && data[key] ? data[key] : item.default
      metaValue[key] = item.json ? JSON.stringify(value) : value
    })
    return { post_id: data.id, ...metaValue }
  }
  async update(data) {
    const postModel = new PostModel(this.schema)
    const relativeModel = new RelativeModel(this.schema)
    const categoryModel = new CategoryModel(this.schema)
    const response = {
      status: "ok",
      body: {}
    }
    const dataSave = await this.dataValidateSave(data, this.schema)
    const dataMeta = this.dataValidateMetaSave(
      data,
      this.schema.metaFields.fields
    )
    await postModel.updateById(data.id, dataSave)
    await postModel.updateMetaById(dataMeta.post_id, dataMeta)
    for await (const item of Object.keys(this.schema.relatives)) {
      if (item === "category") {
        const category = await categoryModel.getByArrTitles(
          data[item],
          data.lang
        )
        const categoryIds = category.map((item) => item.id)
        await relativeModel.update(data.id, item, categoryIds)
      } else {
        const modelRelative = new PostModel(
          this.schema.relatives[item].relativeTable
        )
        const posts = await modelRelative.getByArrTitles(data[item], data.lang)
        const postIds = posts.map((item) => item.id)
        await relativeModel.update(data.id, item, postIds)
      }
    }
    return response
  }
  async store(data) {
    const postModel = new PostModel(this.schema)
    const dataSave = await this.dataValidateInsert(data)
    const dataMeta = this.dataValidateMetaSave(
      data,
      this.schema.metaFields.fields
    )
    const result = await postModel.insert(dataSave, dataMeta)
    return result[0]
  }
  async delete(id) {
    const postModel = new PostModel(this.schema)
    return postModel.deleteById(id)
  }
}
module.exports = BaseService
