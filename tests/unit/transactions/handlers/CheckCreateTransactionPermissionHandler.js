const CheckCreateTransactionPermissionHandler = require("@/app/transactions/handlers/CheckCreateTransactionPermissionHandler")
const FrontUsersModel = require("@/models/FrontUsers")
const crypto = require("crypto")
const model = new FrontUsersModel()
const testUserId = 11
const testUserEmail = "test_user@gmail.com"
const testUserPassword = "212007rf"
describe("CheckCreateTransactionPermissionHandler", async () => {
  const login = "test_user"
  const hash = crypto.createHash("md5").update(testUserPassword).digest("hex")
  const user = await model.getByLoginAndPassword(login, hash)
  const context = {
    body: {
      userId: user.id,
      session: user.remember_token
    }
  }
  const chain = new CheckCreateTransactionPermissionHandler()
  const { errors } = await chain.handle(context)
})
