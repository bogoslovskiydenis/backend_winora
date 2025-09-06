const knex = require("@/db")
class FrontUsersModel {
  #table
  constructor() {
    this.#table = "front_users"
  }
  async insert(data) {
    const [id] = await knex(this.#table).insert(data)
    return id
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
  async getUserById(id) {
    return knex(this.#table)
      .select()
      .where({
        id
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
  async updateCreateTokenById(id, token) {
    await knex(this.#table).where({ id }).update({ create_token: token })
  }
  async checkSession(id, session) {
    return knex(this.#table)
      .where({ id, remember_token: session, role: "user" })
      .first()
  }
  async confirmationRegistration(create_token) {
    return knex(this.#table)
      .select()
      .where({
        create_token
      })
      .first()
  }
  async changeRole(id, role) {
    await knex(this.#table).where({ id }).update({ role })
  }
  async clearCreateToken(id) {
    await knex(this.#table).where({ id }).update({ create_token: "" })
  }
  async updateResetPasswordTokenByEmail(email, token) {
    await knex(this.#table)
      .where({ email, role: "user" })
      .update({ reset_password_token: token })
  }
  async confirmationResetPassword(token) {
    return knex(this.#table)
      .select()
      .where({
        reset_password_token: token
      })
      .first()
  }
  async changePassword(id, hash) {
    await knex(this.#table).where({ id }).update({ password: hash })
  }
  async clearResetPasswordToken(id) {
    await knex(this.#table).where({ id }).update({ reset_password_token: null })
  }
  async destroy() {
    await knex.destroy()
  }
}
module.exports = FrontUsersModel
