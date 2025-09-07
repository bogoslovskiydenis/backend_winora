const CardBuilder = require("@/app/admin/CardBuilder");
const AdminUsersModel = require("@/models/AdminUsers");
const crypto = require("crypto");
class Service {
  static async login(login, password) {
    const response = {
      confirm: "error",
      body: {}
    };
    const err = [];
    const candidate = await AdminUsersModel.checkLogin(login, password);
    if (candidate.data && candidate.confirm === "ok") {
      err.push(candidate.confirm);
      const token = crypto.randomBytes(16).toString("hex");
      const setToken = await AdminUsersModel.setToken(candidate.data.id, token);
      err.push(setToken.confirm);
      candidate.data.remember_token = token;
      response.body = CardBuilder.user(candidate.data);
      response.confirm = err.includes("error") ? "error" : "ok";
    }
    return response;
  }
  static async logout(id, session) {
    const response = {
      confirm: "error",
      body: {}
    };
    const err = [];
    const candidate = await AdminUsersModel.checkSession(id, session);
    if (candidate) {
      const setToken = await AdminUsersModel.setToken(candidate.id, "");
      err.push(setToken.confirm);
      response.confirm = err.includes("error") ? "error" : "ok";
    }
    return response;
  }
  static async checkUser(id, session) {
    const response = {
      confirm: "error",
      body: {}
    };
    const candidate = await AdminUsersModel.checkSession(id, session);
    if (candidate) response.confirm = "ok";
    return response;
  }
}
module.exports = Service;
