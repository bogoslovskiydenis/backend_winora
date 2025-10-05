const sharesModel = require("@/models/Shares")
const ValidatePostStructureHandler = require("@/app/shares/handlers/ValidatePostStructureHandler")
const TrimPostFieldsHandler = require("@/app/shares/handlers/TrimPostFieldsHandler")
const StorePostHandler = require("@/app/shares/handlers/StorePostHandler")
class Service {
  #mainModel
  constructor() {
    this.#mainModel = sharesModel
  }
  async getPublicPostById(id) {
    return await this.#mainModel.getPublicPostById(id)
  }

  async index(settings) {
    const { orderBy, orderKey } = settings
    return {
      status: "ok",
      posts: await this.#mainModel.getPublicPosts(settings),
      sorting: {
        orderBy,
        orderKey
      }
    }
  }

  async indexAdmin(settings) {
    return {
      status: "ok",
      body: await this.#mainModel.getPosts(settings),
      total: await this.#mainModel.getTotalCount()
    }
  }

  async getPostById(id) {
    return await this.#mainModel.getPostById(id)
  }

  async store(data) {
    const context = {
      data,
      errors: [],
      insertId: null
    }
    const chain = new TrimPostFieldsHandler()
    chain
      .setNext(new ValidatePostStructureHandler())
      .setNext(new StorePostHandler())
    const { errors, insertId } = await chain.handle(context)
    return { errors, insertId, status: errors.length ? "error" : "ok" }
  }

  async update(data) {
    const response = {
      status: "error"
    }
    const preparatoryData = {
      title: data.title.trim(),
      subTitle: data.subTitle.trim(),
      image: data.image.trim(),
      depositAmount: Number(data.depositAmount),
      order: data.order,
      status: data.status
    }
    const { status, errors } = await this.dataValidateInsert(preparatoryData)
    if (status === "ok") {
      await this.#mainModel.updateById(data.id, preparatoryData)
      response.status = status
    } else {
      response.errors = errors
    }
    return response
  }

  async delete(id) {
    await this.#mainModel.deleteById(id)
    return { status: "ok" }
  }
  async dataValidateInsert(data) {
    const errors = []
    const { title, subTitle, image, depositAmount } = data

    if (!title || typeof title !== "string") {
      errors.push('"title" обязательно и должно быть строкой')
    }
    if (!subTitle || typeof subTitle !== "string") {
      errors.push('"subTitle" обязателен и должен быть строкой')
    }
    if (!image || typeof image !== "string") {
      errors.push('"image" обязателен')
    } else if (image.length > 255) {
      errors.push('"image" не может быть длиннее 255 символов')
    }
    if (depositAmount === undefined || depositAmount === null) {
      errors.push('"depositAmount" обязателен')
    } else if (typeof depositAmount !== "number" || isNaN(depositAmount)) {
      errors.push('"depositAmount" должен быть числом')
    } else if (depositAmount < 0) {
      errors.push('"depositAmount" должен быть больше 0')
    } else if (depositAmount > 1_000_000) {
      errors.push('"depositAmount" не может превышать 1 000 000')
    }

    return {
      status: errors.length === 0 ? "ok" : "error",
      errors
    }
  }
}
module.exports = new Service()
