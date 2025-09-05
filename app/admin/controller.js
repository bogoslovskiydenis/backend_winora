const { Router } = require("express")
const crypto = require("crypto")
const adminAuth = require("../../middleware/adminAuth")
const AuthService = require("./service")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const { password, login } = req.body
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const response = await AuthService.login(login, hash)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/logout",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { id, session } = req.body
    const response = await AuthService.logout(id, session)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/check-user",
  asyncHandler(async (req, res) => {
    const { id, session } = req.body
    const response = await AuthService.checkUser(id, session)
    res.status(200).json(response)
  })
)
module.exports = router
