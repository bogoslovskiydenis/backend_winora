const OptionsModelKnex = require("@/models/OptionsKnex")
const CardBuilder = require("@/app/options/CardBuilder")
const mainSchema = require("@/schemas/options")

class Service {
  constructor() {
    this.schema = mainSchema
    this.model = new OptionsModelKnex(mainSchema)
  }

  async getPosts() {
    return CardBuilder.mainCard(await this.model.getPosts())
  }

  async indexAdmin() {
    return CardBuilder.adminCard(await this.model.getPosts())
  }

  async getPostById(id) {
    return CardBuilder.adminSingleCard(await this.model.getPostById(id))
  }
  async update(data) {
    const response = {
      status: "ok",
      body: []
    }
    await this.model.update(CardBuilder.update(data), data.id)
    return response
  }
}
module.exports = Service
