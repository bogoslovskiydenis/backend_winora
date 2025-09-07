/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("slots_template", (table) => {
    table.increments("id");
    table.primary(["id"]);
    table.string("url", 500).unique();
    table.text("demo");
    table.string("logo", 200);
    table.string("slot_name", 200);
    table.string("software", 200);
    table.string("rtp", 100);
    table.string("volatility", 200);
    table.string("paylines", 100);
    table.string("reels", 100);
    table.string("min_bet", 100);
    table.string("max_bet", 100);
    table.string("top_win", 200);
    table.string("features", 500);
    table.string("themes", 500);
    table.string("available", 200);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  knex.schema.dropTable("slots_template");
};
