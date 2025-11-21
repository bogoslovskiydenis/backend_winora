exports.up = function (knex) {
    return knex.schema.createTable("balance_changes", function (table) {
        table.increments("id").primary()

        table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("front_users")
            .onDelete("CASCADE")

        table.string("currency", 10).notNullable()

        table
            .enu("operation", ["deposit", "withdraw", "freeze", "unfreeze"])
            .notNullable()

        table.decimal("amount", 18, 8).notNullable()

        table
            .integer("changed_by_user_id")
            .unsigned()
            .nullable()
            .references("id")
            .inTable("front_users")
            .onDelete("SET NULL")

        table
            .integer("changed_by_admin_id")
            .unsigned()
            .nullable()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL")

        table.enu("change_source", ["self", "admin"]).notNullable()

        table.timestamp("changed_at").defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("balance_changes")
}


