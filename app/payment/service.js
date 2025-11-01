const ValidateAmountHandler = require("@/app/payment/handlers/ValidateAmountHandler")
const CreateDepositTransactionHandler = require("@/app/payment/handlers/CreateDepositTransactionHandler")
const ProcessPaymentHandler = require("@/app/payment/handlers/ProcessPaymentHandler")
const SaveTransactionHandler = require("@/app/payment/handlers/SaveTransactionHandler")
const SendDepositNotificationHandler = require("@/app/payment/handlers/SendDepositNotificationHandler")

class PaymentService {
  constructor() {}
  async deposit(userId, amount) {
    const context = { errors: [], userId, amount, insertId: null }

    const chain = new ValidateAmountHandler()
    chain
      .setNext(new CreateDepositTransactionHandler())
      .setNext(new ProcessPaymentHandler())
      .setNext(new SaveTransactionHandler())
      .setNext(new SendDepositNotificationHandler())

    const { errors, insertId } = await chain.handle(context)
    return errors.length
      ? { status: "error", errors }
      : { status: "ok", insertId }
  }
}
module.exports = new PaymentService()
