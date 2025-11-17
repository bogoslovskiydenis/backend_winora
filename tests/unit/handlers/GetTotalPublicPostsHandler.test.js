require("module-alias/register")
require("@/config")
const GetTotalPublicPostsHandler = require("@/app/bonuses/handlers/GetTotalPublicPostsHandler")

jest.mock("@/models/Bonuses", () => ({
    getTotalPublicCount: jest.fn()
}))

const postModel = require("@/models/Bonuses")

describe("GetTotalPublicPostsHandler", () => {
    let handler

    beforeEach(() => {
        handler = new GetTotalPublicPostsHandler()
        jest.clearAllMocks()
    })

    test("должен вернуть общее количество постов", async () => {
        const mockTotal = 42
        postModel.getTotalPublicCount.mockResolvedValue(mockTotal)

        const context = {
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getTotalPublicCount).toHaveBeenCalled()
        expect(result.total).toBe(mockTotal)
        expect(result.errors).toHaveLength(0)
    })

    test("должен вернуть 0, если постов нет", async () => {
        postModel.getTotalPublicCount.mockResolvedValue(0)

        const context = {
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getTotalPublicCount).toHaveBeenCalled()
        expect(result.total).toBe(0)
        expect(result.errors).toHaveLength(0)
    })

    test("должен вернуть context без изменений, если есть ошибки", async () => {
        const context = {
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(postModel.getTotalPublicCount).not.toHaveBeenCalled()
        expect(result).toBe(context)
        expect(result.errors).toContain("Предыдущая ошибка")
        expect(result.total).toBeUndefined()
    })

    test("должен добавить ошибку при ошибке базы данных", async () => {
        const dbError = new Error("Database connection failed")
        postModel.getTotalPublicCount.mockRejectedValue(dbError)

        const context = {
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getTotalPublicCount).toHaveBeenCalled()
        expect(result.errors).toContain("Ошибка при работе с базой: Database connection failed")
        expect(result.total).toBeUndefined()
    })

    test("должен вызвать следующий хендлер, если он установлен", async () => {
        const mockTotal = 10
        postModel.getTotalPublicCount.mockResolvedValue(mockTotal)

        const nextHandler = {
            handle: jest.fn().mockResolvedValue({
                errors: [],
                total: mockTotal
            })
        }
        handler.setNext(nextHandler)

        const context = {
            errors: []
        }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalled()
        expect(result.total).toBe(mockTotal)
    })

    test("должен сохранить предыдущие данные из context", async () => {
        const mockTotal = 25
        postModel.getTotalPublicCount.mockResolvedValue(mockTotal)

        const context = {
            errors: [],
            body: [{ id: 1, title: "Test" }],
            settings: { limit: 10, offset: 0 }
        }

        const result = await handler.handle(context)

        expect(result.total).toBe(mockTotal)
        expect(result.body).toEqual(context.body)
        expect(result.settings).toEqual(context.settings)
    })
})

