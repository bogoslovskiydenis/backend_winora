const { Router } = require("express")
const router = Router()
router.get("/pages/main", async (req, res) => {
  const response = {
    status: "ok",
    state: "Good day"
  }
  res.status(200).json(response)
})
module.exports = router
