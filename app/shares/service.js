const ValidatePostStructureHandler = require("@/app/shares/handlers/ValidatePostStructureHandler")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")
const NormalizePostHandler = require("@/app/shares/handlers/NormalizePostHandler")
const StorePostHandler = require("@/app/shares/handlers/StorePostHandler")
const UpdatePostHandler = require("@/app/shares/handlers/UpdatePostHandler")
const DeletePostHandler = require("@/app/shares/handlers/DeletePostHandler")
const GetPostByIdHandler = require("@/handlers/GetPostByIdHandler")
const GetPublicPostByIdHandler = require("@/app/shares/handlers/GetPublicPostByIdHandler")
const GetPublicPostsHandler = require("@/app/shares/handlers/GetPublicPostsHandler")
const GetPostsHandler = require("@/app/shares/handlers/GetPostsHandler")
const GetTotalPublicPostsHandler = require("@/app/shares/handlers/GetTotalPublicPostsHandler")
const GetTotalPostsHandler = require("@/app/shares/handlers/GetTotalPostsHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const postModel = require("@/models/Shares")

class Service {
  #allowedRoles
  constructor() {
    this.#allowedRoles = ["super_admin", "admin"]
    this.model = postModel
    this.stringTypesField = ["title", "subTitle", "image"]
  }
  async getPublicPostById(id) {
    const context = { data: { id }, errors: [], body: {} }
    const chain = new GetPublicPostByIdHandler()
    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }

  async index(settings) {
    const context = { settings, errors: [], body: {}, total: 0 }
    const chain = new GetPublicPostsHandler()
    chain.setNext(new GetTotalPublicPostsHandler())
    const { errors, body, total } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok", total }
  }

  async indexAdmin({ settings, editorId }) {
    const context = {
      editorId,
      settings,
      errors: [],
      body: {},
      total: 0
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostsHandler()).setNext(new GetTotalPostsHandler())
    const { errors, body, total } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok", total }
  }

  async getPostById({ id, editorId }) {
    const context = { editorId, errors: [], body: {}, data: { id } }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostByIdHandler(this.model))
    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }

  async store({ postData, editorId }) {
    const context = {
      body: postData,
      errors: [],
      insertId: null,
      editorId
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new NormalizePostHandler())
      .setNext(new ValidatePostStructureHandler())
      .setNext(new StorePostHandler())
    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }

  async update({ postData, editorId }) {
    const context = { editorId, errors: [], body: postData }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimFieldsHandler(this.stringTypesField))
      .setNext(new NormalizePostHandler())
      .setNext(new ValidatePostStructureHandler())
      .setNext(new UpdatePostHandler())
    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }

  async delete({ id, editorId }) {
    const context = {
      body: { id },
      errors: [],
      editorId
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new DeletePostHandler())
    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }
}
module.exports = new Service()
