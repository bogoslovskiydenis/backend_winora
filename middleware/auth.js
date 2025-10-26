const FrontUsersModel = require("@/models/FrontUsers")

async function checkFrontAuth(req, res, next) {
  const model = new FrontUsersModel()
  const { id, session } = req.body
  const response = { confirm: "error" }
  try {
    if (!id || !session) {
      return res.status(200).json(response)
    }
    const isValid = await model.checkSession(id, session)
    if (!isValid) {
      return res.status(200).json(response)
    }
    next()
  } catch (err) {
    console.error("Auth middleware error:", err.message)
    res.status(200).json(response)
  }
}

module.exports = checkFrontAuth
