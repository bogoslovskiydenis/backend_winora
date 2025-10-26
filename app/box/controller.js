const { Router } = require("express")
const service = require("@/app/box/service")
const asyncHandler = require("@/helpers/asyncHandler")
const queryParams = require("@/middleware/queryParams")
const adminAuth = require("@/middleware/adminAuth")

const router = Router()

router.get(
  "/box/:url",
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const { status, errors, body } = await service.getPublicPostById(url)
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)
router.get(
  "/boxes",
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
  "/admin/boxes",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit, offset, id } = req.body
    const response = await service.indexAdmin({
      settings: { limit, offset, orderBy: "created_at" },
      editorId: id
    })
    if (response) {
      res.status(200).json(response)
    } else {
      res.status(404).json({ status: "error" })
    }
  })
)
router.post(
  "/admin/box/store",
  adminAuth,
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
  "/admin/box/update",
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
  "/admin/box/delete",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data, id } = req.body
    const { status, errors } = await service.delete({ id: data, editorId: id })
    res.status(200).json(status === "ok" ? { status } : { status, errors })
  })
)
router.post(
  "/admin/box/:url",
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
