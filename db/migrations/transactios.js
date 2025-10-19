exports.up = function up(knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary()
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("front_users")
      .onDelete("CASCADE")

    table
      .enum("type", ["deposit", "withdrawal", "transfer"])
      .notNullable()
      .defaultTo("deposit")

    table.string("currency", 20).notNullable()
    table.string("network", 50).notNullable()

    table.decimal("amount", 36, 18).notNullable()
    table.decimal("fee", 36, 18).defaultTo(0)

    table
      .enum("status", [
        "pending",
        "processing",
        "confirmed",
        "failed",
        "canceled"
      ])
      .notNullable()
      .defaultTo("pending")
    table.string("tx_hash", 255).unique()
    table.string("from_address", 255)
    table.string("to_address", 255)
    table.string("explorer_url", 512)
    table.timestamp("confirmed_at")
    table.text("internal_comment")
    table.text("user_comment")
    table.jsonb("meta")
    table.boolean("is_manual").defaultTo(false)
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    table.index(["user_id"])
    table.index(["status"])
    table.index(["currency"])
    table.index(["network"])
    table.index(["type"])
    table.index(["tx_hash"])
  })
}

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("transactions")
}
