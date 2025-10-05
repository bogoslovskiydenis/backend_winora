const { socketFrontDeposit } = require("@/sockets/front")
class Service {
  constructor() {}
  async deposit(data) {
    const { ids, ...msg } = data
    socketFrontDeposit(ids, msg)
    return {
      status: "ok",
      body: {}
    }
  }
}
module.exports = new Service()
