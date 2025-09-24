const FrontUserChanges = require("@/models/FrontUserChanges")
const AdminUsers = require("@/models/AdminUsers")
const FrontUsers = require("@/models/FrontUsers")
const CardBuilder = require("@/app/user_changes/CardBuilder")
const ReportService = require("@/core/ReportService")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const reportService = new ReportService()

class FrontUserChangesService {
  #model
  #adminModel
  #frontUsers
  constructor() {
    this.#model = new FrontUserChanges()
    this.#adminModel = new AdminUsers()
    this.#frontUsers = new FrontUsers()
  }

  async getPostByUserId(id) {
    const data = await this.#model.getPostByUserId(id)
    if (!data) return
    const adminChanges = await this.#model.getAdminChangesByUserId(id)
    const adminChangesList = []
    for (const post of adminChanges) {
      const adminUser = await this.#adminModel.getUserById(
        post.changed_by_admin_id
      )
      adminChangesList.push({ ...post, editor: adminUser.name })
    }
    const selfChanges = await this.#model.getSelfChangesByUserId(id)
    const frontUser = await this.#frontUsers.getUserById(id)
    const selfChangesList = selfChanges.map((post) => {
      return {
        ...post,
        editor: frontUser.login
      }
    })
    return {
      id: data.user_id,
      self: CardBuilder.adminListChanges(selfChangesList),
      admin: CardBuilder.adminListChanges(adminChangesList)
    }
  }
  async getDistinctAdminByUserId(user_id) {
    const adminIds = await this.#model.getDistinctAdminIdByUserId(user_id)
    const admins = await this.#adminModel.getUsersByIds(adminIds)
    return admins.map(({ name }) => name)
  }
  async getDistinctFieldsByUserId(user_id) {
    return this.#model.getDistinctFieldsByUserId(user_id)
  }
  async filters(user_id, settings) {
    const adminChanges = await this.#model.getAdminChangesWithFiltersByUserId(
      user_id,
      settings
    )
    const adminChangesList = []
    for (const post of adminChanges) {
      const adminUser = await this.#adminModel.getUserById(
        post.changed_by_admin_id
      )
      adminChangesList.push({ ...post, editor: adminUser.name })
    }
    const selfChanges = await this.#model.getSelfChangesWithFiltersByUserId(
      user_id,
      settings
    )
    const frontUser = await this.#frontUsers.getUserById(user_id)
    const selfChangesList = selfChanges.map((post) => {
      return {
        ...post,
        editor: frontUser.login
      }
    })
    return {
      admin: adminChangesList,
      self: selfChangesList
    }
  }
  async report(id, self = [], admin = []) {
    const adminUser = await this.#adminModel.getUserById(id)
    const token = crypto.randomBytes(16).toString("hex")
    const dataAdmin = []
    const dataSelf = []
    admin.forEach((item) => {
      const { changed_at, editor, user_id } = item
      for (const key in item.new_value) {
        dataAdmin.push({
          user_id,
          editor,
          changed_at,
          field: key,
          old_value: item.old_value[key],
          new_value: item.new_value[key]
        })
      }
    })
    self.forEach((item) => {
      const { changed_at, editor, user_id } = item
      for (const key in item.new_value) {
        dataSelf.push({
          user_id,
          editor,
          changed_at,
          field: key,
          old_value: item.old_value[key],
          new_value: item.new_value[key]
        })
      }
    })
    const reportPath = await reportService.report(
      {
        admin_changes: dataAdmin,
        self_changes: dataSelf
      },
      `${token}.xlsx`
    )
    const mailOptions = {
      from: _EMAIL,
      to: adminUser.email,
      subject: "Отчет по изменениям пользователя сайте Winora",
      html: `Отчет по изменениям пользователя перейдите по ссылке ${_API_URL}${reportPath.replace("/public", "")}`
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
    return reportPath
  }
}
module.exports = FrontUserChangesService
