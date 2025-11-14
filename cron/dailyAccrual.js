const cron = require("node-cron")
const investmentService = require("@/app/investments/service.js")

// Каждый день в 00:05
cron.schedule("5 0 * * *", async () => {
  await investmentService.dailyAccrual()
})
