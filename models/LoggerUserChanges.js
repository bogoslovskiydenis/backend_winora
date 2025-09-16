const knex = require("@/db")
class LoggerUserChanges {
  #table
  constructor() {
    this.#table = "user_changes"
  }
  async insert(data) {
    const [id] = await knex(this.#table).insert(data)
    return id
  }
}
module.exports = LoggerUserChanges
