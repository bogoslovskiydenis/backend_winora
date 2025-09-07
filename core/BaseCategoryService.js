const Helper = require("@/helpers")
const CategoryModel = require("@/models/CategoryKnex")
const RelativeModel = require("@/models/RelativeKnex")
const PostModel = require("@/models/PostsKnex")
class BaseCategoryService {
  constructor(mainSchema) {
    this.schema = mainSchema
  }
  async getPublicPostByUrl(url) {
    const response = {
      status: "error",
      body: {}
    }
    const categoryModel = new CategoryModel(this.schema)
    const data = await categoryModel.getPublicPostByUrl(url)
    if (data) {
      const relativeModel = new RelativeModel(this.schema)
      const postModel = new PostModel(this.schema)
      const relativeData = await relativeModel.getPostIdByRelative(
        data.id,
        "category"
      )
      const posts = await postModel.getPublicPostsByArrId(relativeData, {
        orderKey: this.schema.orderBy
      })
      data.faq = data.faq ? JSON.parse(data.faq) : []
      response.status = "ok"
      response.body = {
        posts,
        ...data
      }
    }
    return response
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0,
      lang: _LANG[settings.lang]
    }
    const categoryModel = new CategoryModel(this.schema)
    response.body = await categoryModel.getPosts(settings)
    response.total = await categoryModel.getTotalCountByLang(settings.lang)
    return response
  }
  async getPostById(id) {
    const categoryModel = new CategoryModel(this.schema)
    const post = await categoryModel.getPostById(id)
    post.faq = post.faq ? JSON.parse(post.faq) : []
    const allCategory = await categoryModel.getAllPostsByLang(post.lang)
    const parentCategory = await categoryModel.getPostById(post.parent_id)
    const parentCategoryTitle = !parentCategory ? "" : parentCategory.title
    post.relative_category = {
      all_value: allCategory.map((item) => item.title),
      current_value: parentCategoryTitle ? [parentCategoryTitle] : []
    }
    return post
  }
  async update(data) {
    const categoryModel = new CategoryModel(this.schema)
    const response = {
      status: "ok",
      body: {}
    }
    const dataSave = await this.dataValidateSave(data)
    const parentCategory = await categoryModel.getByArrTitles(
      data.parent_id,
      data.lang
    )
    dataSave.parent_id = parentCategory.length ? parentCategory[0].id : 0
    categoryModel.updateById(data.id, dataSave)
    return response
  }
  async dataValidateSave(data) {
    const newData = this.dataValidate(data)
    newData.permalink = Helper.transliterateUrl(data.permalink)
    const categoryModel = new CategoryModel(this.schema)
    const candidate = await categoryModel.getByPermalink(newData.permalink)
    if (candidate && candidate.id !== data.id) {
      let counter = 1
      const MAX_TRIES = 1000
      for (; counter <= MAX_TRIES; counter++) {
        const newPermalink = `${newData.permalink}-${counter}`
        const newCandidate = await categoryModel.getByPermalink(newPermalink)
        if (!newCandidate) {
          newData.permalink = newPermalink
          break
        }
      }
    }
    return newData
  }
  async dataValidateInsert(data) {
    const newData = this.dataValidate(data)
    newData.lang = _LANG_ID[data.lang] ? _LANG_ID[data.lang] : _LANG_ID.ru
    newData.permalink = Helper.transliterateUrl(data.title)
    const categoryModel = new CategoryModel(this.schema)
    const candidate = await categoryModel.getByPermalink(newData.permalink)
    if (candidate) {
      const MAX_TRIES = 1000
      for (let counter = 1; counter <= MAX_TRIES; counter++) {
        const newPermalink = `${newData.permalink}-${counter}`
        const newCandidate = await categoryModel.getByPermalink(newPermalink)
        if (!newCandidate) {
          newData.permalink = newPermalink
          break
        }
      }
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
    newData.faq = data.faq ? JSON.stringify(data.faq) : null
    return newData
  }
  async store(data) {
    const categoryModel = new CategoryModel(this.schema)
    const newData = await this.dataValidateInsert(data)
    const result = await categoryModel.insert(newData)
    return result[0]
  }
  async delete(id) {
    const categoryModel = new CategoryModel(this.schema)
    return categoryModel.deleteById(id)
  }
}
module.exports = BaseCategoryService
