module.exports = {
  requiredFields: ["user_id", "amount_usd", "strategy_type"],
  fieldTypes: {
    user_id: "number",
    amount_usd: "number",
    status: "string",
    strategy_type: "string",
    preset_type: "string",
    custom_preset_id: "number"
  },
  constraints: {
    amount_usd: { min: 0 },
    status: ["draft", "active", "paused", "closed"],
    strategy_type: ["GAMBLING", "SPORTS"]
  }
}
