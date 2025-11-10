const { getIO, frontUsers } = require("@/sockets")
const io = getIO()
function socketFrontLogin(currentUser, socketId) {
  const { id: userId, remember_token: session, role, login } = currentUser
  const existing = frontUsers.get(userId)
  if (existing) {
    const socketIds = Array.from(frontUsers.get(userId).sockets)
    socketIds.forEach((socketId) => {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) socket.emit("logout")
    })
    frontUsers.set(userId, {
      session,
      role,
      login,
      userId,
      sockets: new Set([socketId])
    })
  } else {
    frontUsers.set(userId, {
      sockets: new Set([socketId]),
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
function socketFrontLogout(userId) {
  const socketIds = Array.from(frontUsers.get(userId).sockets)
  socketIds.forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId)
    if (socket) socket.emit("logout")
  })
  frontUsers.delete(userId)
  io.emit("front_users_update", {
    users: Array.from(frontUsers.values())
  })
}
function socketFrontDeposit(ids, data) {
  ids.forEach((userId) => {
    const user = frontUsers.get(userId)
    if (user) {
      user.sockets.forEach((socketId) => {
        io.to(socketId).emit("notification_deposit", data)
      })
    }
  })
}

function socketFrontBalanceUpdate(ids, data) {
  ids.forEach((userId) => {
    const user = frontUsers.get(userId)
    if (user) {
      user.sockets.forEach((socketId) => {
        io.to(socketId).emit("balance_update", data)
      })
    }
  })
}

module.exports = {
  socketFrontLogin,
  socketFrontLogout,
  socketFrontDeposit,
  socketFrontBalanceUpdate
}
