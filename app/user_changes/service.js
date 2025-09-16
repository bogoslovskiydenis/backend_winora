const FrontUserChanges = require("@/models/FrontUserChanges")
const AdminUsers = require("@/models/AdminUsers")
const FrontUsers = require("@/models/FrontUsers")
const CardBuilder = require("@/app/user_changes/CardBuilder")

class FrontUserChangesService {
  #model
  #adminModel
  #frontUsers
  constructor() {
    this.#model = new FrontUserChanges()
    this.#adminModel = new AdminUsers()
    this.#frontUsers = new FrontUsers()
  }

  async getPostByUserId(id) {
    const data = await this.#model.getPostByUserId(id)
    if (!data) return
    const adminChanges = await this.#model.getAdminChangesByUserId(id)
    const adminChangesList = []
    for (const post of adminChanges) {
      const adminUser = await this.#adminModel.getUserById(
        post.changed_by_admin_id
      )
      adminChangesList.push({ ...post, editor: adminUser.name })
    }
    const selfChanges = await this.#model.getSelfChangesByUserId(id)
    const frontUser = await this.#frontUsers.getUserById(id)
    const selfChangesList = selfChanges.map((post) => {
      return {
        ...post,
        editor: frontUser.login
      }
    })
    return {
      id: data.user_id,
      self: CardBuilder.adminListChanges(selfChangesList),
      admin: CardBuilder.adminListChanges(adminChangesList)
    }
  }
}
module.exports = FrontUserChangesService
