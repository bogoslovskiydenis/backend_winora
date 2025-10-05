const { Router } = require("express")
const adminAuth = require("@/middleware/adminAuth")
const asyncHandler = require("@/helpers/asyncHandler")
const service = require("@/app/notification/service")

const router = Router()
router.post(
  "/admin/notify/deposit",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const response = await service.deposit(data)
    res.status(200).json(response)
  })
)

module.exports = router
