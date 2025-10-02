/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema.createTable("shares", (table) => {
    table.increments("id").primary()
    table.string("title").notNullable()
    table.string("subTitle").defaultTo("") // унифицируем структуру
    table.decimal("depositAmount", 15, 2).notNullable()
    table.integer("order").defaultTo(0)
    table.string("image").defaultTo("")
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable("shares")
}
