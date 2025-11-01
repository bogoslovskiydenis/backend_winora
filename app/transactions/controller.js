const { Router } = require("express")
const asyncHandler = require("@/helpers/asyncHandler")
const checkFrontAuth = require("@/middleware/auth")
const adminAuth = require("@/middleware/adminAuth")
const service = require("@/app/transactions/service")

const router = Router()

router.post(
  "/admin/transactions/status",
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
  "/transactions/user/status",
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

    const { status, body, errors } = await service.getUserTransactionsByStatus({
      userId,
      settings: { limit, offset, statuses, dateFrom, dateTo, order }
    })

    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/transactions/user/types",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const {
      limit = 8,
      offset = 0,
      id: userId,
      types = [],
      dateFrom = null,
      dateTo = null,
      order = "desc"
    } = req.body

    const { status, body, errors } = await service.getUserTransactionsByTypes({
      userId,
      settings: { limit, offset, types, dateFrom, dateTo, order }
    })

    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/transactions/user/:transactionId",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { transactionId } = req.params
    const { id: userId } = req.body
    const { status, body, errors } = await service.getUserTransactionById({
      userId,
      transactionId
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/transactions/user",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const {
      limit = 8,
      offset = 0,
      id: userId,
      dateFrom = null,
      dateTo = null,
      order = "desc",
      orderKey = "created_at"
    } = req.body

    const { status, body, errors } = await service.getUserTransactions({
      userId,
      settings: { limit, offset, dateFrom, dateTo, order, orderKey }
    })

    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/admin/transactions/type",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit = 8, offset = 0, types = [], id } = req.body
    const { status, body, errors } = await service.indexType({
      editorId: id,
      settings: { limit, offset, types }
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)

router.post(
  "/admin/transactions/store",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { data, id } = req.body
    const { status, insertId, errors } = await service.store({
      postData: data,
      editorId: id
    })
    res
      .status(200)
      .json(status === "ok" ? { status, insertId } : { status, errors })
  })
)

router.post(
  "/admin/transaction/update",
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
  "/admin/transaction/:url",
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

module.exports = router
