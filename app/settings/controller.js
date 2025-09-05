const { Router } = require("express")
const Service = require("@/app/settings/service")
const adminAuth = require("@/middleware/adminAuth")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.get(
  "/settings",
  asyncHandler(async (req, res) => {
    const service = new Service()
    const { lang } = req.queryParams || 1
    const response = await service.getPosts(lang)
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
router.post(
  "/admin/settings/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body
    const service = new Service()
    const response = await service.update(data)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/settings/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const service = new Service()
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
router.post(
  "/admin/settings",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { lang } = req.body
    const service = new Service()
    const response = await service.indexAdmin(lang)
    if (response) {
      res.status(200).json({
        status: "ok",
        body: response,
        lang: lang === 1 ? "ua" : "en"
      })
    } else {
      res.status(404).json({ status: "error" })
    }
  })
)
module.exports = router
