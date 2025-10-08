const ValidatePostStructureHandler = require("@/app/bonuses/handlers/ValidatePostStructureHandler")
const TrimPostFieldsHandler = require("@/app/bonuses/handlers/TrimPostFieldsHandler")
const NormalizePostHandler = require("@/app/bonuses/handlers/NormalizePostHandler")
const StorePostHandler = require("@/app/bonuses/handlers/StorePostHandler")
const UpdatePostHandler = require("@/app/bonuses/handlers/UpdatePostHandler")
const DeletePostHandler = require("@/app/bonuses/handlers/DeletePostHandler")
const GetPostByIdHandler = require("@/app/bonuses/handlers/GetPostByIdHandler")
const GetPublicPostByIdHandler = require("@/app/bonuses/handlers/GetPublicPostByIdHandler")
const GetPublicPostsHandler = require("@/app/bonuses/handlers/GetPublicPostsHandler")
const GetPostsHandler = require("@/app/bonuses/handlers/GetPostsHandler")
const GetTotalPublicPostsHandler = require("@/app/bonuses/handlers/GetTotalPublicPostsHandler")
const GetTotalPostsHandler = require("@/app/bonuses/handlers/GetTotalPostsHandler")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")

class Service {
  #allowedRoles
  constructor() {
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
