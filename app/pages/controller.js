const { Router } = require("express")
const service = require("@/app/pages/service")
const adminAuth = require("@/middleware/adminAuth")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.get(
  "/page/main",
  asyncHandler(async (req, res) => {
    const response = await service.mainPage("main")
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      })
    else res.status(404).json({ status: "error" })
  })
)
router.get(
  "/page/shop",
  asyncHandler(async (req, res) => {
    const response = await service.shop(req.params.url)
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      })
    else res.status(404).json({ status: "error" })
  })
)
router.post(
  "/admin/pages/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const response = await service.update(data)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/pages/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const response = await service.getPostById(url)
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      })
    else res.status(404).json({ status: "error" })
  })
)
router.post(
  "/admin/pages",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { lang, limit, offset } = req.body
    const settings = { lang, limit, offset }
    const response = await service.indexAdmin(settings)
    res.status(200).json(response)
  })
)
module.exports = router
