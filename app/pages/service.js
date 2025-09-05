const PageModel = require("../../models/PageKnex")
const mainSchema = require("../../schemas/page")
class Service {
  constructor() {
    this.schema = mainSchema
  }
  async mainPage(url) {
    return await this.getPublicPostByUrl(url)
  }
  async getPublicPostByUrl(url) {
    const pageModel = new PageModel(this.schema)
    return await pageModel.getPublicPostByUrl(url)
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0,
      lang: _LANG[settings.lang]
    }
    const pageModel = new PageModel(this.schema)
    response.body = await pageModel.getPosts(settings)
    response.total = await pageModel.getTotalCountByLang(settings.lang)
    return response
  }
  async getPostById(id) {
    const model = new PageModel(this.schema)
    return await model.getPostById(id)
  }

  async getPublicPosts(settings) {
    const pageModel = new PageModel(this.schema)
  }
  async update(data) {
    const pageModel = new PageModel(this.schema)
    const response = {
      status: "ok",
      body: {}
    }
    const dataSave = this.dataValidate(data)
    await pageModel.updateById(data.id, dataSave)
    return response
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
}
module.exports = Service
