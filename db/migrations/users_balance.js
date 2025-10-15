exports.up = function (knex) {
  return knex.schema.createTable("users_balance", function (table) {
    table.increments("id").primary()
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("front_users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.string("currency", 10).notNullable()
    table.decimal("balance", 18, 8).defaultTo(0)
    table.decimal("locked_balance", 18, 8).defaultTo(0)
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.timestamp("updated_at").defaultTo(knex.fn.now())

    table.unique(["user_id", "currency"])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users_balance")
}
