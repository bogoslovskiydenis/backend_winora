const { getIO } = require("@/sockets")

function sendGlobalNotification(message) {
  const io = getIO()
  io.emit("notification", { message })
}

module.exports = { sendGlobalNotification }
