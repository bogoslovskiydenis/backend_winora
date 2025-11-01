// /mocks/transactionMock.js
const { randomUUID } = require("crypto")

function randomEnum(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generateMockTransaction(userId, amount) {
  const statuses = ["pending", "processing", "confirmed", "failed"]
  const types = ["deposit", "withdrawal", "transfer"]
  const networks = ["TRC20"]
  const currencies = ["USDT"]

  const status = randomEnum(statuses)
  const type = randomEnum(types)
  const network = randomEnum(networks)
  const currency = randomEnum(currencies)

  return {
    user_id: userId,
    type,
    currency,
    network,
    amount: amount ?? (Math.random() * 1000).toFixed(2),
    fee: (Math.random() * 5).toFixed(2),
    status,
    tx_hash: randomUUID(),
    from_address: status === "deposit" ? randomUUID().slice(0, 16) : null,
    to_address: status === "withdrawal" ? randomUUID().slice(0, 16) : null,
    explorer_url: `https://explorer.mock/${randomUUID()}`,
    confirmed_at:
      status === "confirmed"
        ? new Date().toISOString().slice(0, 19).replace("T", " ")
        : null,
    internal_comment: "Mock transaction created for testing",
    user_comment:
      status === "failed" ? "Transaction failed due to mock error" : null,
    meta: JSON.stringify({
      isMock: true,
      networkFee: "0.1",
      requestId: randomUUID()
    }),
    is_manual: 0,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " ")
  }
}

module.exports = { generateMockTransaction }
