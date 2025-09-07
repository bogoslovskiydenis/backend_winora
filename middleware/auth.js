const FrontUsersModel = require("./../models/FrontUsers");
async function checkFrontAuth(req, res, next) {
  const model = new FrontUsersModel();
  const response = { confirm: "error" };
  const { id, session } = req.body;
  const candidate = await model.checkSession(id, session);
  if (candidate) next();
  else res.status(200).json(response);
}
module.exports = checkFrontAuth;
