const { Router } = require("express")
const adminAuth = require("@/middleware/adminAuth")
const Service = require("@/app/upload/service")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.post(
  "/admin/uploads",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { file } = req.body
    const response = await Service.upload(file.name, file.base64)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/media",
  adminAuth,
  asyncHandler((req, res) => {
    const response = Service.media()
    res.status(200).json(response)
  })
)
router.post(
  "/admin/delete-media",
  adminAuth,
  asyncHandler((req, res) => {
    const { file } = req.body
    const response = Service.delete(file)
    res.status(200).json(response)
  })
)
module.exports = router
