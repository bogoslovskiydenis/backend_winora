const CheckCreateTransactionPermissionHandler = require("@/app/transactions/handlers/CheckCreateTransactionPermissionHandler")
const FrontUsersModel = require("@/models/FrontUsers")
const crypto = require("crypto")

describe("CheckCreateTransactionPermissionHandler (integration-style)", () => {
  const handler = new CheckCreateTransactionPermissionHandler()
  const model = new FrontUsersModel()
  let user
  beforeAll(async () => {
    const login = "test_user"
    const password = "212007rf"
    const hash = crypto.createHash("md5").update(password).digest("hex")
    user = await model.getByLoginAndPassword(login, hash)
  })

  test("✅ успешная проверка — пользователь авторизован и имеет роль user", async () => {
    const context = {
      body: { userId: user.id, session: user.remember_token },
      errors: []
    }
    const result = await handler.handle(context)
    expect(result.errors).toHaveLength(0)
  })

  test("❌ ошибка — не указан userId", async () => {
    const context = {
      body: { session: user.remember_token },
      errors: []
    }
    const result = await handler.handle(context)
    expect(result.errors).toContain("userId не указан")
  })

  test("❌ ошибка — не указан session", async () => {
    const context = {
      body: { userId: user.id },
      errors: []
    }
    const result = await handler.handle(context)
    expect(result.errors).toContain("session не указан")
  })

  test("❌ ошибка — неверная сессия", async () => {
    const context = {
      body: { userId: user.id, session: "invalid_session_token" },
      errors: []
    }
    const result = await handler.handle(context)
    expect(result.errors).toContain("Пользователь не авторизован")
  })
})
