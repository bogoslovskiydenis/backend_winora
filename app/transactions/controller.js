const { Router } = require("express")
const asyncHandler = require("@/helpers/asyncHandler")
const checkFrontAuth = require("@/middleware/auth")
const adminAuth = require("@/middleware/adminAuth")
const service = require("@/app/transactions/service")

const router = Router()

router.get(
  "/transactions/status/:url",
  // adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const { limit, offset } = req.body
    const { status, body, errors } = await service.indexStatus({
      limit,
      offset,
      url
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/transactions/store",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const { status, insertId, errors } = await service.store(data)
    res
      .status(200)
      .json(status === "ok" ? { status, insertId } : { status, errors })
  })
)

module.exports = router
