const PostsKnex = require("@/models/PostsKnex")
const BoxesSchema = require("@/schemas/boxes")

class BoxesModel extends PostsKnex {
  constructor(schema) {
    super(schema)
  }
}
module.exports = new BoxesModel(BoxesSchema)
