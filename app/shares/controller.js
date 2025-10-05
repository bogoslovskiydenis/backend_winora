const { Router } = require("express")
const service = require("@/app/shares/service")
const asyncHandler = require("@/helpers/asyncHandler")
const queryParams = require("@/middleware/queryParams")
const adminAuth = require("@/middleware/adminAuth")

const router = Router()

router.get(
  "/share/:url",
  asyncHandler(async (req, res) => {
    const response = await service.getPublicPostById(req.params.url)
    if (response) {
      res.status(200).json({
        status: "ok",
        body: response
      })
    } else {
      res.status(404).json({ status: "error" })
    }
  })
)
router.get(
  "/shares",
  queryParams,
  asyncHandler(async (req, res) => {
    const settings = {}
    if ("queryParams" in req) {
      for (const key in req.queryParams) {
        if (Object.hasOwn(req.queryParams, key)) {
          settings[key] = req.queryParams[key]
        }
      }
    }
    const response = await service.index(settings)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/shares",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit, offset } = req.body
    const response = await service.indexAdmin({ limit, offset })
    if (response) {
      res.status(200).json(response)
    } else {
      res.status(404).json({ status: "error" })
    }
  })
)
router.post(
  "/admin/share/store",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const { status, insertId, errors } = await service.store(data)
    res
      .status(200)
      .json(status === "ok" ? { status, insertId } : { status, errors })
  })
)
router.post(
  "/admin/share/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const { status, errors } = await service.update(data)
    res.status(200).json(status === "ok" ? { status } : { status, errors })
  })
)
router.post(
  "/admin/share/delete",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const { status, errors } = await service.delete(data)
    res.status(200).json(status === "ok" ? { status } : { status, errors })
  })
)
router.post(
  "/admin/share/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const response = await service.getPostById(url)
    if (response) {
      res.status(200).json({
        status: "ok",
        body: response
      })
    } else {
      res.status(404).json({ status: "error" })
    }
  })
)

module.exports = router
