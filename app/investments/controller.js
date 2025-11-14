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

router.get(
  "/investments/presets",
  asyncHandler(async (req, res) => {
    const { status, body, errors } = await service.getActivePresets()
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
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

router.post(
  "/investments/complete",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { investmentId, id: userId } = req.body

    const { status, body, errors } = await service.completeInvestment({
      userId,
      investmentId
    })

    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/admin/investments/status",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit = 8, offset = 0, statuses = [], id } = req.body
    const { status, body, errors } = await service.indexStatus({
      editorId: id,
      settings: { limit, offset, statuses }
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/admin/investments/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data, id } = req.body
    const { status, errors } = await service.update({
      postData: data,
      editorId: id
    })
    res.status(200).json(status === "ok" ? { status } : { status, errors })
  })
)

router.post(
  "/admin/investments/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const { id } = req.body
    const { status, errors, body } = await service.getPostById({
      id: url,
      editorId: id
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.get(
  "/test",
  asyncHandler(async (req, res) => {
    const { status, errors, body } = await service.dailyAccrual()
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

module.exports = router
