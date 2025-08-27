const { Router } = require("express")
const router = Router()
const UserService = require("./Service")
const userService = new UserService()
const { createResponse } = require("../../helpers/functions")
router.get("/users/register", async (req, res) => {
  const response = await userService.register()
  const data = createResponse(response)
  res.status(200).json(data)
})
router.get("/users/login", async (req, res) => {
  const response = await userService.login()
  const data = createResponse(response)
  res.status(200).json(data)
})
router.get("/users/reset-password", async (req, res) => {
  const response = await userService.resetPassword()
  const data = createResponse(response)
  res.status(200).json(data)
})
router.get("/users/change-user", async (req, res) => {
  const response = await userService.changeUser()
  const data = createResponse(response)
  res.status(200).json(data)
})
router.get("/users/delete-user", async (req, res) => {
  const response = await userService.deleteUser()
  const data = createResponse(response)
  res.status(200).json(data)
})
module.exports = router
