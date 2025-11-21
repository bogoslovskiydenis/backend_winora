const ValidateAmountHandler = require("@/app/payment/handlers/ValidateAmountHandler")
const CreateDepositTransactionHandler = require("@/app/payment/handlers/CreateDepositTransactionHandler")
const ProcessPaymentHandler = require("@/app/payment/handlers/ProcessPaymentHandler")
const SaveTransactionHandler = require("@/app/payment/handlers/SaveTransactionHandler")
const ExecuteBalanceOperationHandler = require("@/app/balance/handlers/ExecuteBalanceOperationHandler")
const EmitBalanceUpdateHandler = require("@/handlers/EmitBalanceUpdateHandler")
const TransactionCommentHandler = require("@/app/payment/handlers/TransactionCommentHandler")

class PaymentService {
  constructor() {
    this.allowedCurrencies = ["USDT", "W_TOKEN"]
  }
  async deposit(user_id, amount) {
    const context = {
      errors: [],
      insertId: null,
      body: {
        operation: "deposit",
        user_id,
        currency: "USDT",
        amount
      }
    }

    const chain = new ValidateAmountHandler()
    chain
      .setNext(new CreateDepositTransactionHandler())
      .setNext(new ProcessPaymentHandler())
      .setNext(new SaveTransactionHandler())
      .setNext(new TransactionCommentHandler())
      .setNext(new ExecuteBalanceOperationHandler())
      .setNext(new EmitBalanceUpdateHandler())

    const { errors, insertId } = await chain.handle(context)
    return errors.length
      ? { status: "error", errors }
      : { status: "ok", insertId }
  }
}
module.exports = new PaymentService()
