require("module-alias/register")
require("@/config")
const GetTotalPostsHandler = require("@/app/bonuses/handlers/GetTotalPostsHandler")

jest.mock("@/models/Bonuses", () => ({
  getTotalCount: jest.fn()
}))

const postModel = require("@/models/Bonuses")

describe("GetTotalPostsHandler", () => {
  let handler

  beforeEach(() => {
    handler = new GetTotalPostsHandler()
    jest.clearAllMocks()
  })

  test("возвращает общее количество постов", async () => {
    postModel.getTotalCount.mockResolvedValue(15)
    const context = { errors: [] }

    const result = await handler.handle(context)

    expect(postModel.getTotalCount).toHaveBeenCalled()
    expect(result.total).toBe(15)
    expect(result.errors).toHaveLength(0)
  })

  test("возвращает 0, если постов нет", async () => {
    postModel.getTotalCount.mockResolvedValue(0)
    const context = { errors: [] }

    const result = await handler.handle(context)

    expect(postModel.getTotalCount).toHaveBeenCalled()
    expect(result.total).toBe(0)
  })

  test("не вызывает базу, если уже есть ошибки", async () => {
    const context = { errors: ["предыдущая ошибка"] }

    const result = await handler.handle(context)

    expect(postModel.getTotalCount).not.toHaveBeenCalled()
    expect(result.errors).toContain("предыдущая ошибка")
    expect(result.total).toBeUndefined()
  })

  test("добавляет ошибку при исключении из модели", async () => {
    const dbError = new Error("DB failed")
    postModel.getTotalCount.mockRejectedValue(dbError)
    const context = { errors: [] }

    const result = await handler.handle(context)

    expect(postModel.getTotalCount).toHaveBeenCalled()
    expect(result.errors).toContain("Ошибка при работе с базой: DB failed")
    expect(result.total).toBeUndefined()
  })

  test("передает контекст следующему хендлеру", async () => {
    postModel.getTotalCount.mockResolvedValue(3)
    const nextHandler = {
      handle: jest.fn().mockResolvedValue({ forwarded: true })
    }
    handler.setNext(nextHandler)

    const context = { errors: [] }
    const result = await handler.handle(context)

    expect(nextHandler.handle).toHaveBeenCalledWith({ ...context, total: 3 })
    expect(result).toEqual({ forwarded: true })
  })
})


