const AdminUsersModel = require("./../models/AdminUsers")
async function checkAdminAuth(req, res, next) {
  const model = new AdminUsersModel()
  const response = { confirm: "error" }
  const { id, session } = req.body
  const candidate = await AdminUsersModel.checkSession(id, session)
  if (candidate) next()
  else res.status(200).json(response)
}
module.exports = checkAdminAuth
