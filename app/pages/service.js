const pageModel = require("@/models/PageKnex")
const GetPublicPostsHandler = require("@/handlers/GetPublicPostsHandler")
const boxesModel = require("@/models/Boxes")
const sharesModel = require("@/models/Shares")
const bonusesModel = require("@/models/Bonuses")

class Service {
  async mainPage(url) {
    return await this.getPublicPostByUrl(url)
  }
  async getPublicPostByUrl(url) {
    return await pageModel.getPublicPostByUrl(url)
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0,
      lang: _LANG[settings.lang]
    }
    response.body = await pageModel.getPosts(settings)
    response.total = await pageModel.getTotalCountByLang(settings.lang)
    return response
  }
  async getPostById(id) {
    return await pageModel.getPostById(id)
  }
  async update(data) {
    const response = {
      status: "ok",
      body: {}
    }
    const dataSave = this.dataValidate(data)
    await pageModel.updateById(data.id, dataSave)
    return response
  }
  async shop() {
    const context = { errors: [], body: {} }
    const chain = new GetPublicPostsHandler(
      boxesModel,
      {
        orderBy: "order",
        orderKey: "asc",
        limit: 100,
        offset: 0
      },
      "boxes"
    )
    chain
      .setNext(
        new GetPublicPostsHandler(
          sharesModel,
          {
            orderBy: "order",
            orderKey: "asc",
            limit: 100,
            offset: 0
          },
          "shares"
        )
      )
      .setNext(
        new GetPublicPostsHandler(
          bonusesModel,
          {
            orderBy: "order",
            orderKey: "asc",
            limit: 100,
            offset: 0
          },
          "bonuses"
        )
      )
    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
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
module.exports = new Service()
