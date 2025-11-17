require("module-alias/register")
require("@/config")
const GetPostByIdHandler = require("@/handlers/GetPostByIdHandler")

describe("GetPostByIdHandler", () => {
  let handler
  let mockModel

  beforeEach(() => {
    mockModel = {
      getPostById: jest.fn()
    }
    handler = new GetPostByIdHandler(mockModel)
    jest.clearAllMocks()
  })

  test("возвращает пост при успешном запросе", async () => {
    const mockPost = { id: 1, title: "Test" }
    mockModel.getPostById.mockResolvedValue(mockPost)

    const context = { data: { id: 1 }, errors: [] }
    const result = await handler.handle(context)

    expect(mockModel.getPostById).toHaveBeenCalledWith(1)
    expect(result.body).toEqual(mockPost)
    expect(result.errors).toHaveLength(0)
  })

  test("добавляет ошибку, если пост не найден", async () => {
    mockModel.getPostById.mockResolvedValue(null)
    const context = { data: { id: 99 }, errors: [] }

    const result = await handler.handle(context)

    expect(mockModel.getPostById).toHaveBeenCalledWith(99)
    expect(result.errors).toContain("Пост с таким id не существует")
    expect(result.body).toBeUndefined()
  })

  test("не вызывает модель, если уже есть ошибки", async () => {
    const context = { data: { id: 1 }, errors: ["prev error"] }

    const result = await handler.handle(context)

    expect(mockModel.getPostById).not.toHaveBeenCalled()
    expect(result).toBe(context)
    expect(result.errors).toContain("prev error")
  })

  test("добавляет ошибку при исключении модели", async () => {
    const dbError = new Error("DB failed")
    mockModel.getPostById.mockRejectedValue(dbError)

    const context = { data: { id: 2 }, errors: [] }
    const result = await handler.handle(context)

    expect(mockModel.getPostById).toHaveBeenCalledWith(2)
    expect(result.errors).toContain("Ошибка при работе с базой: DB failed")
    expect(result.body).toBeUndefined()
  })

  test("передает контекст в следующий хендлер", async () => {
    const mockPost = { id: 3, title: "Next" }
    mockModel.getPostById.mockResolvedValue(mockPost)

    const nextHandler = {
      handle: jest.fn().mockResolvedValue({ forwarded: true })
    }
    handler.setNext(nextHandler)

    const context = { data: { id: 3 }, errors: [] }
    const result = await handler.handle(context)

    expect(nextHandler.handle).toHaveBeenCalledWith(context)
    expect(result).toEqual({ forwarded: true })
  })
})


