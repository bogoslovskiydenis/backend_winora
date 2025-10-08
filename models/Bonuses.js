const PostsKnex = require("@/models/PostsKnex")
const BonusSchema = require("@/schemas/bonuses")

class BonusesModel extends PostsKnex {
  constructor(schema) {
    super(schema)
  }
}
module.exports = new BonusesModel(BonusSchema)
