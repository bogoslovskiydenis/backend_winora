exports.up = function (knex) {
  return knex.schema.createTable("investments", function (table) {
    table.increments("id").primary()

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("front_users")
      .onDelete("CASCADE")

    table.decimal("amount_usd", 18, 2).notNullable().defaultTo(0)

    table
      .enu("status", ["draft", "active", "paused", "closed"])
      .notNullable()
      .defaultTo("draft")

    table
      .enu("strategy_type", ["GAMBLING", "SPORTS"])
      .notNullable()
      .defaultTo("GAMBLING")

    table.string("preset_type").nullable()
    table.integer("custom_preset_id").nullable()

    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.timestamp("activated_at").nullable()
    table.timestamp("closed_at").nullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("investments")
}
