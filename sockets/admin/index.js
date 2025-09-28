const { getIO, adminUsers } = require("@/sockets")
const io = getIO()
function socketAdminLogin(currentUser, socketId) {
  const { id: userId, remember_token: session, role, name: login } = currentUser
  const existing = adminUsers.get(userId)
  if (existing) {
    const socketIds = Array.from(adminUsers.get(userId).sockets)
    socketIds.forEach((socketId) => {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) socket.emit("logout")
    })
    adminUsers.set(userId, {
      ...existing,
      session,
      role,
      login,
      userId,
      sockets: new Set([socketId])
    })
  } else {
    adminUsers.set(userId, {
      sockets: new Set([socketId]),
      session,
      role,
      login,
      userId
    })
  }
  io.emit("admin_users_update", {
    users: Array.from(adminUsers.values())
  })
}
function socketAdminLogout(userId) {
  const socketIds = Array.from(adminUsers.get(userId).sockets)
  socketIds.forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId)
    if (socket) socket.emit("logout")
  })
  adminUsers.delete(userId)
  io.emit("admin_users_update", {
    users: Array.from(adminUsers.values())
  })
}
module.exports = { socketAdminLogin, socketAdminLogout }
