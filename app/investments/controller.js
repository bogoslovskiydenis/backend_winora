const { Router } = require("express")
const service = require("@/app/investments/service")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")
const checkFrontAuth = require("@/middleware/auth")

const router = Router()

router.post(
  "/investments/store",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { id: userId, data } = req.body

    const { status, insertId, errors } = await service.store(userId, data)

    res
      .status(200)
      .json(status === "ok" ? { status, insertId } : { status, errors })
  })
)

router.post(
  "/investments/user/status",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const {
      limit = 8,
      offset = 0,
      id: userId,
      statuses = [],
      dateFrom = null,
      dateTo = null,
      order = "desc"
    } = req.body

    const { status, body, errors } = await service.getUserInvestmentsByStatus({
      userId,
      settings: { limit, offset, statuses, dateFrom, dateTo, order }
    })

    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

module.exports = router
