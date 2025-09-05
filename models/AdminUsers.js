const knex = require("../db")
class AdminUsersModel {
  #table
  constructor() {
    this.#table = "users"
  }
  static async checkLogin(login, password) {
    const response = {
      data: [],
      confirm: "ok"
    }
    try {
      response.data = await knex("users")
        .select()
        .where({ name: login, password })
        .first()
      return response
    } catch (error) {
      console.log(error)
      response.confirm = "error"
      return response
    }
  }
  async getUserByLogin(login) {
    return knex(this.#table)
      .select()
      .where({
        login
      })
      .first()
  }
  async getUserByEmail(email) {
    return knex(this.#table)
      .select()
      .where({
        email
      })
      .first()
  }
  async getByLoginAndPassword(login, password) {
    return knex(this.#table)
      .select()
      .where({
        login,
        password
      })
      .first()
  }
  async updateRememberTokenById(id, token) {
    await knex(this.#table).where({ id }).update({ remember_token: token })
  }
  static async checkSession(id, session) {
    return knex("users").where({ id, remember_token: session }).first()
  }
  static async setToken(id, token) {
    const response = {
      data: [],
      confirm: "ok"
    }
    try {
      await knex("users").where({ id: id }).update({ remember_token: token })
      return response
    } catch (error) {
      console.log(error)
      response.confirm = "error"
      return response
    }
  }
}
module.exports = AdminUsersModel
