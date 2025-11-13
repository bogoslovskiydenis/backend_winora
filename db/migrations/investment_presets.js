/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("investment_presets", (table) => {
    table.increments("id").primary()
    table
      .string("slug", 64)
      .notNullable()
      .unique()
      .comment("Уникальный код пресета")
    table.string("name", 128).notNullable().comment("Название пресета")
    table
      .decimal("profit_percent", 5, 2)
      .notNullable()
      .comment("Процент доходности")
    table.boolean("is_active").defaultTo(true).comment("Активен ли пресет")
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.timestamp("updated_at").defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("investment_presets")
}
