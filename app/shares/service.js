const sharesModel = require("@/models/Shares")
const ValidatePostStructureHandler = require("@/app/shares/handlers/ValidatePostStructureHandler")
const TrimPostFieldsHandler = require("@/app/shares/handlers/TrimPostFieldsHandler")
const NormalizePostHandler = require("@/app/shares/handlers/NormalizePostHandler")
const StorePostHandler = require("@/app/shares/handlers/StorePostHandler")
const UpdatePostHandler = require("@/app/shares/handlers/UpdatePostHandler")
const DeletePostHandler = require("@/app/shares/handlers/DeletePostHandler")
const GetPostByIdHandler = require("@/app/shares/handlers/GetPostByIdHandler")
const GetPublicPostByIdHandler = require("@/app/shares/handlers/GetPublicPostByIdHandler")
const GetPublicPostsHandler = require("@/app/shares/handlers/GetPublicPostsHandler")
const GetPostsHandler = require("@/app/shares/handlers/GetPostsHandler")
const GetTotalPublicPostsHandler = require("@/app/shares/handlers/GetTotalPublicPostsHandler")
const GetTotalPostsHandler = require("@/app/shares/handlers/GetTotalPostsHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
class Service {
  #mainModel
  #allowedRoles
  constructor() {
    this.#mainModel = sharesModel
    this.#allowedRoles = ["super_admin", "admin"]
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

  async indexAdmin(data) {
    const context = {
      data,
      errors: [],
      body: {},
      total: 0
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostsHandler()).setNext(new GetTotalPostsHandler())
    const { errors, body, total } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok", total }
  }

  async getPostById(data) {
    const context = { data, errors: [], body: {} }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new GetPostByIdHandler())
    const { errors, body } = await chain.handle(context)
    return { errors, body, status: errors.length ? "error" : "ok" }
  }

  async store(data) {
    const context = {
      data,
      errors: [],
      insertId: null
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimPostFieldsHandler())
      .setNext(new NormalizePostHandler())
      .setNext(new ValidatePostStructureHandler())
      .setNext(new StorePostHandler())
    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }

  async update(data) {
    const context = { data, errors: [] }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain
      .setNext(new TrimPostFieldsHandler())
      .setNext(new NormalizePostHandler())
      .setNext(new ValidatePostStructureHandler())
      .setNext(new UpdatePostHandler())
    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }

  async delete(data) {
    const context = {
      data,
      errors: [],
      insertId: null
    }
    const chain = new CheckPostPermissionHandler(this.#allowedRoles)
    chain.setNext(new DeletePostHandler())
    const { errors } = await chain.handle(context)
    return { errors, status: errors.length ? "error" : "ok" }
  }
}
module.exports = new Service()
