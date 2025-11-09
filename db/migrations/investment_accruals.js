exports.up = function (knex) {
  return knex.schema.createTable("investment_accruals", function (table) {
    table.increments("id").primary()

    table
      .integer("investment_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("investments")
      .onDelete("CASCADE")
    table.decimal("amount_usd", 18, 2).notNullable().defaultTo(0)
    table.timestamp("accrued_at").notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("investment_accruals")
}
