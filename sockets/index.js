const { Server } = require("socket.io")
const AdminUsersModel = require("@/models/AdminUsers")
const FrontUsersModel = require("@/models/FrontUsers")
const frontUsersModel = new FrontUsersModel()

const frontUsers = new Map()
const adminUsers = new Map()
let ioInstance = null

function initSocket(server) {
  const io = new Server(server, {
    path: "/api/socket.io",
    cors: {
      origin: [
        "http://localhost:3000",
        "https://dev-site.site",
        "https://admin.dev-site.site"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  })

  io.on("connection", async (socket) => {
    console.log("Клиент подключился:", socket.id)
    const { userId, location, session } = socket.handshake.auth || {}

    if (location === "admin") {
      socket.join("admin")
      if (session && userId) {
        const candidate = await AdminUsersModel.checkSession(userId, session)
        if (candidate) {
          const { role, name: login } = candidate
          if (adminUsers.has(userId)) {
            adminUsers.get(userId).sockets.add(socket.id)
          } else {
            adminUsers.set(userId, {
              sockets: new Set([socket.id]),
              session,
              role,
              login,
              userId
            })
          }
          io.emit("admin_users_update", {
            users: Array.from(adminUsers.values())
          })
          io.emit("front_users_update", {
            users: Array.from(frontUsers.values())
          })
        }
      }
    } else if (location === "front") {
      socket.join("front")
      const { userId, session } = socket.handshake.auth || {}
      if (session && userId) {
        const candidate = await frontUsersModel.checkSession(userId, session)
        if (candidate) {
          const { role, login } = candidate
          if (frontUsers.has(userId)) {
            frontUsers.get(userId).sockets.add(socket.id)
          } else {
            frontUsers.set(userId, {
              sockets: new Set([socket.id]),
              session,
              role,
              login,
              userId
            })
          }
          io.emit("front_users_update", {
            users: Array.from(frontUsers.values())
          })
        }
      }
    }
    const sockets = await io.in("front").fetchSockets()
    const socketIds = sockets.map((socket) => socket.id)
    socket.on("disconnect", () => {
      console.log("❌ Клиент отключился:", socket.id)
      const { userId, location } = socket.handshake.auth || {}
      if (userId && location === "admin") {
        if (adminUsers.has(userId)) {
          const userData = adminUsers.get(userId)
          userData.sockets.delete(socket.id)
          if (userData.sockets.size === 0) {
            adminUsers.delete(userId)
          }
        }
        io.emit("admin_users_update", {
          users: Array.from(adminUsers.values())
        })
      } else if (userId && location === "front") {
        if (frontUsers.has(userId)) {
          const userData = frontUsers.get(userId)
          userData.sockets.delete(socket.id)
          if (userData.sockets.size === 0) {
            frontUsers.delete(userId)
          }
        }
        io.emit("front_users_update", {
          users: Array.from(frontUsers.values())
        })
      }
    })
  })
  ioInstance = io
  return io
}

function getIO() {
  if (!ioInstance) {
    throw new Error(
      "❌ Socket.IO не инициализирован. Вызови initSocket(server) сначала."
    )
  }
  return ioInstance
}
module.exports = {
  initSocket,
  getIO,
  frontUsers,
  adminUsers
}
