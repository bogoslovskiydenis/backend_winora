/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("slots_launch", (table) => {
    table.increments("id")
    table.primary(["id"])
    table.string("url", 500).unique()
    table.text("demo")
    table.string("logo", 200)
    table.string("slot_name", 200)
    table.string("software", 200)
    table.string("themes", 500)
    table.string("type", 200)
    table.string("released", 200)
    table.string("reels", 200)
    table.string("paylines", 200)
    table.string("rtp", 200)
    table.string("min_max_bet", 200)
    table.string("max_exposure", 200)
    table.string("volatility", 200)
    table.string("megaways", 200)
    table.string("bonus_buy", 200)
    table.string("auto_play", 200)
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.timestamp("updated_at").defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  knex.schema.dropTable("slots_launch")
}
