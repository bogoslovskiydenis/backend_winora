const { Router } = require("express")
const UserChangesService = require("@/app/user_changes/service")
const { createResponse } = require("@/helpers/functions")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")

const userChangesService = new UserChangesService()
const router = Router()

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
