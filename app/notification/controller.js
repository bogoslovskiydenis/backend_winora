const { Router } = require("express")
const adminAuth = require("@/middleware/adminAuth")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.post(
  "/admin/notify",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { password, login } = req.body
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const response = await AuthService.login(login, hash)
    res.status(200).json(response)
  })
)

module.exports = router
