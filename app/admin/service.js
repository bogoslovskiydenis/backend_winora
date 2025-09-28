const CardBuilder = require("@/app/admin/CardBuilder")
const AdminUsersModel = require("@/models/AdminUsers")
const crypto = require("crypto")
const { socketAdminLogin, socketAdminLogout } = require("@/sockets/admin")
class Service {
  static async login(login, password, socketId) {
    const response = {
      confirm: "error",
      body: {}
    }
    const err = []
    const candidate = await AdminUsersModel.checkLogin(login, password)
    if (candidate.data && candidate.confirm === "ok") {
      err.push(candidate.confirm)
      const token = crypto.randomBytes(16).toString("hex")
      await AdminUsersModel.setToken(candidate.data.id, token)
      candidate.data.remember_token = token
      socketAdminLogin(candidate.data, socketId)
      response.body = CardBuilder.user(candidate.data)
      response.confirm = err.includes("error") ? "error" : "ok"
    }
    return response
  }
  static async logout(id, session) {
    const response = {
      confirm: "error",
      body: {}
    }
    const candidate = await AdminUsersModel.checkSession(id, session)
    if (candidate) {
      await AdminUsersModel.setToken(candidate.id, "")
      socketAdminLogout(candidate.id)
      response.confirm = "ok"
    }
    return response
  }
  static async checkUser(id, session) {
    const response = {
      confirm: "error",
      body: {}
    }
    const candidate = await AdminUsersModel.checkSession(id, session)
    if (candidate) response.confirm = "ok"
    return response
  }
}
module.exports = Service
