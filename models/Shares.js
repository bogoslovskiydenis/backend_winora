const PostsKnex = require("@/models/PostsKnex")
const SharesSchema = require("@/schemas/shares")

class SharesModel extends PostsKnex {
  constructor(schema) {
    super(schema)
  }
}
module.exports = new SharesModel(SharesSchema)
