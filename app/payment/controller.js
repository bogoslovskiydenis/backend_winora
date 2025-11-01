const { Router } = require("express")
const checkFrontAuth = require("@/middleware/auth")
const asyncHandler = require("@/helpers/asyncHandler")
const service = require("@/app/payment/service")

const router = Router()
router.post(
  "/payment/deposit",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { id: userId, amount } = req.body
    const { status, errors, insertId } = await service.deposit(userId, amount)
    res
      .status(200)
      .json(status === "ok" ? { status, insertId } : { status, errors })
  })
)
module.exports = router
