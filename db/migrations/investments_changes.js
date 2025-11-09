exports.up = function (knex) {
  return knex.schema.createTable("investment_edits", function (table) {
    table.increments("id").primary()

    table
      .integer("investment_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("investments")
      .onDelete("CASCADE")

    table.timestamp("edited_at").defaultTo(knex.fn.now())

    table.string("field").notNullable()
    table.string("old_value").nullable()
    table.string("new_value").nullable()

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
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("investment_edits")
}
