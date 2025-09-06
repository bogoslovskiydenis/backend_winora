require("module-alias/register")
require("@/config")
const FrontUsersModel = require("@/models/FrontUsers")
const crypto = require("crypto")
const model = new FrontUsersModel()
const testUserId = 11
const testUserEmail = "test_user@gmail.com"
const testUserPassword = "212007rf"
describe("AdminUsersModel", () => {
  test("Check login and object containing keys", async () => {
    const login = "test_user"
    const hash = crypto.createHash("md5").update(testUserPassword).digest("hex")
    const user = await model.getByLoginAndPassword(login, hash)
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        login: "test_user",
        email: testUserEmail,
        password: "8681ddd8ac7460f09a69e691ec98250e",
        role: "user",
        created_at: expect.any(String),
        updated_at: expect.any(String),
        create_token: "",
        reset_password_token: null
      })
    )
  })
  test("Check getUserByLogin", async () => {
    const login = "test_user"
    const user = await model.getUserByLogin(login)
    expect(user.login).toBe(login)
  })
  test("Check getUserByEmail", async () => {
    const user = await model.getUserByEmail(testUserEmail)
    expect(user.email).toBe(testUserEmail)
  })
  test("Check updateRememberTokenById", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateRememberTokenById(testUserId, token)
    const user = await model.getUserById(testUserId)
    expect(user.remember_token).toBe(token)
    await model.updateRememberTokenById(testUserId, "")
  })
  test("Check checkSession", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateRememberTokenById(testUserId, token)
    const user = await model.checkSession(testUserId, token)
    expect(user.remember_token).toBe(token)
    await model.updateRememberTokenById(testUserId, "")
  })
  test("Check confirmationRegistration", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateCreateTokenById(testUserId, token)
    const user = await model.confirmationRegistration(token)
    expect(user.create_token).toBe(token)
    await model.updateCreateTokenById(testUserId, "")
  })
  test("Check changeRole", async () => {
    await model.changeRole(testUserId, "candidate")
    const user = await model.getUserById(testUserId)
    expect(user.role).toBe("candidate")
    await model.changeRole(testUserId, "user")
  })
  test("Check clearCreateToken", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateCreateTokenById(testUserId, token)
    const user = await model.getUserById(testUserId)
    expect(user.create_token).toBe(token)
    await model.clearCreateToken(testUserId)
    const candidate = await model.getUserById(testUserId)
    expect(candidate.create_token).toBe("")
  })
  test("Check updateResetPasswordTokenByEmail", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateResetPasswordTokenByEmail(testUserEmail, token)
    const user = await model.getUserById(testUserId)
    expect(user.reset_password_token).toBe(token)
    await model.updateResetPasswordTokenByEmail(testUserEmail, null)
  })
  test("Check confirmationResetPassword", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateResetPasswordTokenByEmail(testUserEmail, token)
    const user = await model.confirmationResetPassword(token)
    expect(user.reset_password_token).toBe(token)
    await model.updateResetPasswordTokenByEmail(testUserEmail, null)
  })
  test("Check changePassword", async () => {
    const hash = crypto.createHash("md5").update(testUserPassword).digest("hex")
    const newPassword = crypto
      .createHash("md5")
      .update("newPassword")
      .digest("hex")
    await model.changePassword(testUserId, newPassword)
    const user = await model.getUserById(testUserId)
    expect(user.password).toBe(newPassword)
    await model.changePassword(testUserId, hash)
  })
  test("Check clearResetPasswordToken", async () => {
    const token = crypto.randomBytes(16).toString("hex")
    await model.updateResetPasswordTokenByEmail(testUserEmail, token)
    await model.clearResetPasswordToken(testUserId)
    const user = await model.getUserById(testUserId)
    expect(user.reset_password_token).toBe(null)
    await model.destroy()
  })
})
