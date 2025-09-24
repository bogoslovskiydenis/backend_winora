const { Router } = require("express")
const UserChangesService = require("@/app/user_changes/service")
const { createResponse } = require("@/helpers/functions")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")

const userChangesService = new UserChangesService()
const router = Router()

router.post(
  "/admin/user-changes/filters/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const { editor, field, periodFrom, periodTo } = req.body
    const response = await userChangesService.filters(url, {
      field,
      editor,
      periodFrom,
      periodTo
    })
    res.status(200).json(createResponse(response))
  })
)
router.post(
  "/admin/user-changes/report",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { id, admin, self } = req.body
    const response = {
      status: "ok",
      body: {
        test: "Test 1"
      }
    }
    response.body.path = await userChangesService.report(id, self, admin)
    res.status(200).json(createResponse(response))
  })
)
router.post(
  "/admin/user-changes/distinct-admin/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const response = await userChangesService.getDistinctAdminByUserId(url)
    res.status(200).json(createResponse(response))
  })
)
router.post(
  "/admin/user-changes/distinct-fields/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const response = await userChangesService.getDistinctFieldsByUserId(url)
    res.status(200).json(createResponse(response))
  })
)
router.post(
  "/admin/user-changes/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const response = await userChangesService.getPostByUserId(url)
    res.status(200).json(createResponse(response))
  })
)
module.exports = router
