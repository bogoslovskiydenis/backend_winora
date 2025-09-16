const crypto = require("crypto")
const FrontUsersModel = require("@/models/FrontUsers")
const {
  validateEmail,
  validateMinLength,
  diffObjects
} = require("@/helpers/functions")
const CardBuilder = require("@/app/users/CardBuilder")
const MIN_LENGTH_LOGIN = 4
const LoggerUserChanges = require("@/models/LoggerUserChanges")
const AdminUsers = require("@/models/AdminUsers")
const nodemailer = require("nodemailer")

class UserService {
  #model
  #adminModel
  #loggerUserChanges
  constructor() {
    this.#model = new FrontUsersModel()
    this.#adminModel = new AdminUsers()
    this.#loggerUserChanges = new LoggerUserChanges()
  }
  async register(data) {
    const { login = "", email = "", password = "" } = data
    const errors = []
    const loginExist = await this.#model.getUserByLogin(login)
    const emailExist = await this.#model.getUserByEmail(email)
    if (!validateMinLength(login, MIN_LENGTH_LOGIN)) errors.push("Error login")
    else if (!validateMinLength(password, 5)) errors.push("Error password")
    else if (!validateEmail(email)) errors.push("Email not valid")
    else if (loginExist) errors.push("This login already registered.")
    else if (emailExist) errors.push("This email already registered.")
    if (errors.length) return { errors }
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const create_token = crypto.randomBytes(16).toString("hex")
    const mailOptions = {
      from: _EMAIL,
      to: email,
      subject: "Письмо подтверждение регистрации на сайте Winora",
      html: `Для завершения регистрации перейдите по ссылке ${_FRONT_DOMAIN}/users/confirmation-registration/${create_token}`
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: _EMAIL,
        pass: _GMAIL_KEY
      }
    })
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Ошибка:", `${error} ${info}`)
      }
    })
    return {
      insertId: await this.#model.insert({
        login,
        email,
        create_token,
        password: hash
      })
    }
  }
  async login(login, password) {
    const hash = crypto.createHash("md5").update(password).digest("hex")
    const candidate = await this.#model.getByLoginAndPassword(login, hash)
    if (candidate && candidate.role !== "candidate") {
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
  async resetPassword(email) {
    const candidate = await this.#model.getUserByEmail(email)
    if (candidate && candidate.role === "user") {
      const token = crypto.randomBytes(16).toString("hex")
      await this.#model.updateResetPasswordTokenByEmail(email, token)
      const mailOptions = {
        from: _EMAIL,
        to: email,
        subject: "Письмо для смены пароля на сайте Winora",
        html: `Для смены пароля перейдите по ссылке ${_FRONT_DOMAIN}/users/check-reset-password/${token}`
      }
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: _EMAIL,
          pass: _GMAIL_KEY
        }
      })
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Ошибка:", `${error} ${info}`)
        }
      })
    }
    return {
      result: "resetPassword"
    }
  }
  async checkResetPassword(token) {
    const candidate = await this.#model.confirmationResetPassword(token)
    if (!candidate) return
    return { id: candidate.id }
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
  async confirmationRegistration(create_token) {
    const candidate = await this.#model.confirmationRegistration(create_token)
    if (!candidate) return
    await this.#model.changeRole(candidate.id, "user")
    await this.#model.clearCreateToken(candidate.id)
    return { id: candidate.id }
  }
  async setNewPassword(token, password) {
    const candidate = await this.#model.confirmationResetPassword(token)
    if (!candidate) return
    const hash = crypto.createHash("md5").update(password).digest("hex")
    await this.#model.changePassword(candidate.id, hash)
    await this.#model.clearResetPasswordToken(candidate.id)
    return { id: candidate.id }
  }
  async checkSession(id, session) {
    return await this.#model.checkSession(id, session)
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0
    }
    response.body = CardBuilder.indexAdmin(await this.#model.getPosts(settings))
    response.total = await this.#model.getTotalCount()
    return response
  }
  async getPostById(id) {
    return CardBuilder.singleAdmin(await this.#model.getPostById(id))
  }
  async update(data, adminUserId) {
    const errors = []
    const response = {
      status: "ok",
      body: {}
    }
    const currentUser = await this.#model.getPostById(data.id)
    const candidateByLogin = await this.#model.getUserByLogin(data.login)
    if (candidateByLogin && candidateByLogin.id !== currentUser.id) {
      errors.push("THIS_LOGIN_EXIST")
    }
    const candidateByEmail = await this.#model.getUserByEmail(data.email)
    if (candidateByEmail && candidateByEmail.id !== currentUser.id) {
      errors.push("THIS_EMAIL_EXIST")
    }
    if (!validateEmail(data.email)) errors.push("EMAIL_NOT_VALID")
    if (!validateMinLength(data.login, MIN_LENGTH_LOGIN))
      errors.push("LOGIN_IS_SHORT")
    if (errors.length) {
      response.status = "error"
      response.body = errors
    } else {
      const dataSave = this.dataValidate(data)
      const adminUser = await this.#adminModel.getUserById(adminUserId)
      const old_value_user = await this.#model.getPostById(data.id)
      const diff = diffObjects(dataSave, old_value_user)
      if (diff.length) {
        const transaction_id = crypto.randomBytes(16).toString("hex")
        for (const diffItem of diff) {
          const logData = {
            ...diffItem,
            transaction_id,
            user_id: data.id,
            changed_by_admin_id: adminUser.id,
            change_source: "admin"
          }
          await this.#loggerUserChanges.insert(logData)
        }
        await this.#model.updateById(data.id, dataSave)
      }
    }
    return response
  }
  dataValidate(data) {
    const newData = {}
    newData.login = data.login || ""
    newData.role = data.role || "candidate"
    newData.email = data.email
    if (data.created_at) newData.created_at = data.created_at
    return newData
  }
}
module.exports = UserService
