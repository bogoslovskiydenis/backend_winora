const BaseHandler = require("@/core/BaseHandler")
const AdminUsers = require("@/models/AdminUsers")
const nodemailer = require("nodemailer")

module.exports = class SendReportEmailHandler extends BaseHandler {
    constructor() {
        super()
        this.adminModel = new AdminUsers()
    }

    async handle(context) {
        const { errors, editorId, reportPath } = context
        if (errors.length > 0) return context
        if (!reportPath) {
            errors.push("Путь к отчету не сгенерирован")
            return context
        }

        try {
            const adminUser = await this.adminModel.getUserById(editorId)
            if (!adminUser) {
                errors.push("Администратор не найден")
                return context
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: _EMAIL, pass: _GMAIL_KEY }
            })

            const mailOptions = {
                from: _EMAIL,
                to: adminUser.email,
                subject: "Отчет по изменениям инвестиций Winora",
                html:
                    `Отчет по изменениям инвестиций: ` +
                    `${_API_URL}${String(reportPath).replace("/public", "")}`
            }

            await transporter.sendMail(mailOptions)
        } catch (err) {
            errors.push(`Ошибка отправки email: ${err.message}`)
            return context
        }

        return super.handle(context)
    }
}


