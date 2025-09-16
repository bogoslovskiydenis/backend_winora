const knex = require("@/db")
class FrontUserChanges {
  #table
  constructor() {
    this.#table = "user_changes"
  }
  async getPostByUserId(user_id) {
    return knex(this.#table)
      .select()
      .where({
        user_id
      })
      .first()
  }
  async getSelfChangesByUserId(user_id) {
    const rows = await knex(this.#table)
      .select(
        "transaction_id",
        "user_id",
        "changed_by_user_id",
        "changed_at",
        knex.raw(`
      CONCAT(
        '{',
        GROUP_CONCAT(
          CONCAT('"', field, '": {"old": "', old_value, '", "new": "', new_value, '"}')
          SEPARATOR ', '
        ),
        '}'
      ) as changes
    `)
      )
      .where({ change_source: "self", user_id })
      .groupBy("transaction_id", "user_id")
    return rows.map(
      ({
        transaction_id,
        user_id,
        changes,
        changed_by_user_id,
        changed_at
      }) => {
        const changesObj = JSON.parse(changes)
        const old_value = {}
        const new_value = {}
        for (let key in changesObj) {
          old_value[key] = changesObj[key].old
          new_value[key] = changesObj[key].new
        }
        return {
          transaction_id,
          user_id,
          changed_by_user_id,
          changed_at,
          old_value,
          new_value
        }
      }
    )
  }
  async getAdminChangesByUserId(user_id) {
    const rows = await knex(this.#table)
      .select(
        "transaction_id",
        "user_id",
        "changed_by_admin_id",
        "changed_at",
        knex.raw(`
      CONCAT(
        '{',
        GROUP_CONCAT(
          CONCAT('"', field, '": {"old": "', old_value, '", "new": "', new_value, '"}')
          SEPARATOR ', '
        ),
        '}'
      ) as changes
    `)
      )
      .where({ change_source: "admin", user_id })
      .groupBy("transaction_id", "user_id")
    return rows.map(
      ({
        transaction_id,
        user_id,
        changed_by_admin_id,
        changes,
        changed_at
      }) => {
        const changesObj = JSON.parse(changes)
        const old_value = {}
        const new_value = {}
        for (let key in changesObj) {
          old_value[key] = changesObj[key].old
          new_value[key] = changesObj[key].new
        }
        console.log(changed_at)
        return {
          transaction_id,
          user_id,
          changed_by_admin_id,
          changed_at,
          old_value,
          new_value
        }
      }
    )
  }
}
module.exports = FrontUserChanges
