const { Router } = require("express")
const Service = require("@/app/options/service")
const adminAuth = require("@/middleware/adminAuth")
const asyncHandler = require("@/helpers/asyncHandler")

const router = Router()
router.get(
  "/options",
  asyncHandler(async (req, res) => {
    const service = new Service()
    const response = await service.getPosts(req.params.url)
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
  "/admin/options/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const service = new Service()
    const { data } = req.body
    const response = await service.update(data)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/options/:url",
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
  "/admin/options",
  adminAuth,
  asyncHandler(async (req, res) => {
    const service = new Service()
    const response = await service.indexAdmin()
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
