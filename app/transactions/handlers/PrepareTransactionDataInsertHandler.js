const BaseHandler = require("@/core/BaseHandler")

module.exports = class PrepareTransactionDataInsertHandler extends BaseHandler {
  async handle(context) {
    const { body, errors } = context
    if (errors.length > 0) return context
    context.prepareData = {
      user_id: body.userId,
      type: body.type,
      status: body.status,
      currency: body.currency,
      network: body.network,
      amount: Number(body.amount),
      fee: Number(body.fee),
      is_manual: body.is_manual,
      tx_hash: body.tx_hash,
      from_address: body.from_address,
      to_address: body.to_address,
      explorer_url: body.explorer_url,
      internal_comment: body.internal_comment,
      user_comment: body.user_comment
    }
    return super.handle(context)
  }
}
