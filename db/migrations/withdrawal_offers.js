exports.up = function (knex) {
  return knex.schema.createTable("withdrawal_offers", function (table) {
    table.increments("id").primary()

    table
      .integer("investment_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("investments")
      .onDelete("CASCADE")

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("front_users")
      .onDelete("CASCADE")

    table.decimal("amount_usd", 18, 2).notNullable().defaultTo(0)

    table
      .enu("status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending")

    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.timestamp("processed_at").nullable()

    table
      .integer("processed_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")

    table.string("note").nullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("withdrawal_offers")
}
