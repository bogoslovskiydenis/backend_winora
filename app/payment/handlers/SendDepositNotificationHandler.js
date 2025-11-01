const BaseHandler = require("@/core/BaseHandler")
const transactionModel = require("@/models/Transactions")
const UserModel = require("@/models/FrontUsers")
const nodemailer = require("nodemailer")

module.exports = class SendDepositNotificationHandler extends BaseHandler {
  async handle(context) {
    const { errors, insertId, userId } = context

    if (errors.length > 0) return context

    try {
      const userModel = new UserModel()
      const user = await userModel.getUserById(userId)
      const transaction = await transactionModel.getPostById(insertId)

      if (!user || !transaction) {
        errors.push(
          "Не удалось найти пользователя или транзакцию для уведомления"
        )
        return context
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: _EMAIL, pass: _GMAIL_KEY }
      })

      let mailOptions = null
      if (transaction.status === "confirmed") {
        mailOptions = {
          from: _EMAIL,
          to: user.email,
          subject: "Ваш депозит успешно зачислен 💸",
          html: `
            <h2>Здравствуйте, ${user.name || "пользователь"}!</h2>
            <p>Ваш депозит был успешно зачислен на счёт.</p>
            <p><strong>Сумма:</strong> ${transaction.amount} USD</p>
            <p>Дата: ${new Date(transaction.confirmed_at).toLocaleString()}</p>
            <p>Спасибо, что пользуетесь Winora 💚</p>
            <a href="${_FRONT_DOMAIN}/profile/transactions">Перейти к транзакциям</a>
          `
        }
      } else if (
        transaction.status === "canceled" ||
        transaction.status === "failed"
      ) {
        mailOptions = {
          from: _EMAIL,
          to: user.email,
          subject: "Ваш депозит не был зачислен ❗️",
          html: `
            <h2>Здравствуйте, ${user.name || "пользователь"}!</h2>
            <p>К сожалению, ваш депозит на сумму <strong>${transaction.amount} USD</strong> не был зачислен.</p>
            <p>Причина: ${transaction.internal_comment || "Неизвестная ошибка"}</p>
            <p>Проверьте данные карты или попробуйте снова.</p>
            <hr/>
            <a href="${_FRONT_DOMAIN}/support">Связаться с поддержкой</a>
          `
        }
      } else {
        mailOptions = {
          from: _EMAIL,
          to: user.email,
          subject: "Статус вашего депозита обновлён ⏳",
          html: `
            <h2>Здравствуйте, ${user.name || "пользователь"}!</h2>
            <p>Статус вашей транзакции обновлён: <strong>${transaction.status}</strong></p>
            <p>Проверьте детали на странице <a href="${_FRONT_DOMAIN}/profile/transactions">транзакций</a>.</p>
          `
        }
      }
      if (mailOptions) {
        await transporter.sendMail(mailOptions)
      }
    } catch (err) {
      errors.push("Ошибка при отправке уведомления пользователю")
      return context
    }

    return super.handle(context)
  }
}
