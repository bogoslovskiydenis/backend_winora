require("module-alias/register")
require("@/config")
const DeleteByIdHandler = require("@/handlers/DeleteByIdHandler")

describe("DeleteByIdHandler", () => {
  test("вызывает model.deleteById при валидном id", async () => {
    const mockModel = { deleteById: jest.fn().mockResolvedValue() }
    const handler = new DeleteByIdHandler(mockModel)
    const context = { body: { id: 5 }, errors: [] }

    const result = await handler.handle(context)

    expect(mockModel.deleteById).toHaveBeenCalledWith(5)
    expect(result.errors).toHaveLength(0)
  })

  test("добавляет ошибку, если id не указан", async () => {
    const mockModel = { deleteById: jest.fn() }
    const handler = new DeleteByIdHandler(mockModel)
    const context = { body: {}, errors: [] }

    const result = await handler.handle(context)

    expect(mockModel.deleteById).not.toHaveBeenCalled()
    expect(result.errors).toContain("Не указан идентификатор записи (id)")
  })

  test("не вызывает модель, если уже есть ошибки", async () => {
    const mockModel = { deleteById: jest.fn() }
    const handler = new DeleteByIdHandler(mockModel)
    const context = { body: { id: 1 }, errors: ["existing"] }

    const result = await handler.handle(context)

    expect(mockModel.deleteById).not.toHaveBeenCalled()
    expect(result.errors).toContain("existing")
  })

  test("добавляет ошибку при исключении из модели", async () => {
    const mockModel = {
      deleteById: jest.fn().mockRejectedValue(new Error("DB error"))
    }
    const handler = new DeleteByIdHandler(mockModel)
    const context = { body: { id: 2 }, errors: [] }

    const result = await handler.handle(context)

    expect(mockModel.deleteById).toHaveBeenCalledWith(2)
    expect(result.errors).toContain("Ошибка при удалении из базы: DB error")
  })

  test("передает context в следующий хендлер при успехе", async () => {
    const mockModel = { deleteById: jest.fn().mockResolvedValue() }
    const handler = new DeleteByIdHandler(mockModel)
    const nextHandler = {
      handle: jest.fn().mockResolvedValue({ forwarded: true })
    }
    handler.setNext(nextHandler)

    const context = { body: { id: 3 }, errors: [] }
    const result = await handler.handle(context)

    expect(nextHandler.handle).toHaveBeenCalledWith(context)
    expect(result).toEqual({ forwarded: true })
  })
})


