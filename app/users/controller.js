const { Router, response } = require("express")
const router = Router()
const UserService = require("./Service")
const userService = new UserService()
const { createResponse } = require("../../helpers/functions")
router.post("/users/register", async (req, res) => {
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
router.post("/users/login", async (req, res) => {
  const { login, password } = req.body
  const response = await userService.login(login, password)
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
router.get("/users/confirmation-registration/:url", async (req, res) => {
  const response = await userService.confirmationRegistration(req.params.url)
  res.status(200).json(createResponse(response))
})
module.exports = router
