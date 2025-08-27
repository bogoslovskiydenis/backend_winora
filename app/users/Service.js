class UserService {
  async register() {
    return {
      service: "register"
    }
  }
  async login() {
    return {
      service: "login"
    }
  }
  async resetPassword() {
    return {
      result: "resetPassword"
    }
  }
  async changeUser() {
    return {
      result: "changeUser"
    }
  }
  async deleteUser() {
    return {
      result: "deleteUser"
    }
  }
}
module.exports = UserService
