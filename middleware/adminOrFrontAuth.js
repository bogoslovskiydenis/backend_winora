const AdminUsersModel = require("@/models/AdminUsers")
const FrontUsersModel = require("@/models/FrontUsers")
const frontUsersModel = new FrontUsersModel()

async function checkAdminOrFrontAuth(req, res, next) {
  const response = { confirm: "error" }
  const { id, session } = req.body
  const candidateAdmin = await AdminUsersModel.checkSession(id, session)
  const candidateFront = await frontUsersModel.checkSession(id, session)
  if (candidateAdmin || candidateFront) next()
  else res.status(200).json(response)
}
module.exports = checkAdminOrFrontAuth
