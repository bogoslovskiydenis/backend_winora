exports.up = async function up(knex) {
  await knex.schema.createTable("user_changes", (table) => {
    table.bigIncrements("id").primary()
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("front_users")
      .onDelete("CASCADE")
    table.text("old_value")
    table.text("new_value")
    table
      .integer("changed_by_user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("front_users")
      .onDelete("SET NULL")
    table
      .integer("changed_by_admin_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
    table.enu("change_source", ["self", "admin"]).notNullable()
    table.timestamp("changed_at").defaultTo(knex.fn.now())
  })
}
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_changes")
}
