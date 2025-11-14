require("module-alias/register")
require("@/config")
const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const http = require("http")
const HelperApp = require("@/helpers/app")
const Logger = require("@/error_log/Logger")
const { initSocket } = require("@/sockets")

const app = express()
const server = http.createServer(app)
const io = initSocket(server)
require("@/cron/dailyAccrual")

app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use("/img", express.static(path.join(__dirname, "img")))
app.use(cors({ credentials: true }))
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dev-site.site",
      "https://admin.dev-site.site"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
)
app.use((req, res, next) => {
  if (req.get("origin"))
    res.setHeader("Access-Control-Allow-Origin", req.get("origin"))
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  )
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Cookie"
  )
  res.setHeader("Access-Control-Allow-Credentials", true)
  next()
})

function initControllers() {
  const arrDir = HelperApp.getAppDir()
  arrDir.forEach((dir) => {
    const filePath = `${_APP_DIR}/${dir}/controller.js`
    if (fs.existsSync(filePath)) {
      const Controller = require(filePath)
      app.use("/api", Controller)
    }
  })
}
initControllers()
app.use((err, req, res, next) => {
  Logger.store(err)
  res.status(500).json({ status: "error", message: "Internal Server Error" })
})

function startApp() {
  try {
    server.listen(_PORT, _IP, () => {
      console.log(`🚀 SERVER START ON PORT ${_PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

startApp()
module.exports = { app, io }
