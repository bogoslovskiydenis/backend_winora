const FrontUsersModel = require("../../models/FrontUsers")
const crypto = require("crypto")
const { validateEmail, validateMinLength } = require("../../helpers/functions")
const CardBuilder = require("./CardBuilder")
class UserService {
  #model
  constructor() {
    this.#model = new FrontUsersModel()
  }
  async register(data) {
    const { login, email, password } = data
    const errors = []
    const loginExist = await this.#model.getUserByLogin(login)
    const emailExist = await this.#model.getUserByEmail(email)
    if (!validateMinLength(login, 4)) errors.push("Error login")
    else if (!validateMinLength(password, 5)) errors.push("Error password")
    else if (!validateEmail(email)) errors.push("Email not valid")
    else if (loginExist) errors.push("This login already registered.")
    else if (emailExist) errors.push("This email already registered.")
    if (errors.length) return { errors }
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const create_token = crypto.randomBytes(16).toString("hex")
    return {
      insertId: await this.#model.insert({
        login,
        email,
        password: hash,
        create_token
      })
    }
  }
  async login(login, password) {
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const candidate = await this.#model.getByLoginAndPassword(login, hash)
    if (candidate) {
      const token = crypto.randomBytes(16).toString("hex")
      await this.#model.updateRememberTokenById(candidate.id, token)
      return CardBuilder.user({
        ...candidate,
        remember_token: token
      })
    } else {
      return { status: "error" }
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
