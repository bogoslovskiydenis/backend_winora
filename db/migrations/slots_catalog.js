/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("slots_catalog", (table) => {
    table.increments("id");
    table.primary(["id"]);
    table.string("url", 500).unique();
    table.text("demo");
    table.string("logo", 200);
    table.string("slot_name", 200);
    table.string("software", 200);
    table.string("release_date", 200);
    table.string("type", 200);
    table.string("rtp", 100);
    table.string("variance", 200);
    table.string("top_win", 200);
    table.string("min_bet", 100);
    table.string("max_bet", 100);
    table.string("layout", 100);
    table.string("betways", 100);
    table.string("features", 500);
    table.string("themes", 500);
    table.string("other_tags", 200);
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
