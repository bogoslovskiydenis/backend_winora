const { Router } = require("express")
const UserService = require("@/app/users/service")
const { createResponse } = require("@/helpers/functions")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")
const checkFrontAuth = require("@/middleware/auth")

const userService = new UserService()
const router = Router()
router.post(
  "/users/register",
  asyncHandler(async (req, res) => {
    const { login, email, password } = req.body
    const requestData = {
      login,
      email,
      password
    }
    const response = await userService.register(requestData)
    if ("errors" in response)
      res.status(200).json({ status: "error", body: response })
    else res.status(200).json({ status: "ok", body: response })
  })
)
router.post(
  "/users/login",
  asyncHandler(async (req, res) => {
    const { login, password, socketId } = req.body
    const response = await userService.login(login, password, socketId)
    const data = createResponse(response)
    res.status(200).json(data)
  })
)
router.post(
  "/users/logout",
  checkFrontAuth,
  asyncHandler(async (req, res) => {
    const { id, session } = req.body
    const response = await userService.logout(id, session)
    res.status(200).json(response)
  })
)
router.post(
  "/users/reset-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body
    const response = await userService.resetPassword(email)
    res.status(200).json(createResponse(response))
  })
)
router.get(
  "/users/check-reset-password/:url",
  asyncHandler(async (req, res) => {
    const response = await userService.checkResetPassword(req.params.url)
    res.status(200).json(createResponse(response))
  })
)
router.post(
  "/users/set-new-password",
  asyncHandler(async (req, res) => {
    const { token, password } = req.body
    const response = await userService.setNewPassword(token, password)
    res.status(200).json(createResponse(response))
  })
)
router.get(
  "/users/change-user",
  asyncHandler(async (req, res) => {
    const response = await userService.changeUser()
    const data = createResponse(response)
    res.status(200).json(data)
  })
)
router.get(
  "/users/delete-user",
  asyncHandler(async (req, res) => {
    const response = await userService.deleteUser()
    const data = createResponse(response)
    res.status(200).json(data)
  })
)
router.get(
  "/users/confirmation-registration/:url",
  asyncHandler(async (req, res) => {
    const { status, errors, body } = await userService.confirmationRegistration(
      req.params.url
    )
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)
router.post(
  "/users/check-session",
  asyncHandler(async (req, res) => {
    const { id, session } = req.body
    const response = await userService.checkSession(id, session)
    const status = response ? "ok" : "error"
    res.status(200).json({ status })
  })
)
router.post(
  "/admin/users",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit, offset } = req.body
    const settings = { limit, offset }
    const response = await userService.indexAdmin(settings)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/user/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data, id: adminUserId } = req.body
    const response = await userService.update(data, adminUserId)
    res.status(200).json(response)
  })
)
router.post(
  "/admin/user/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params
    const { id } = req.body
    const { status, errors, body } = await userService.getPostById({
      id: url,
      editorId: id
    })
    res
      .status(200)
      .json(status === "ok" ? { status, body } : { status, errors })
  })
)
module.exports = router
