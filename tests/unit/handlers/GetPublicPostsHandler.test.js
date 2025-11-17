require("module-alias/register")
require("@/config")
const GetPublicPostsHandler = require("@/app/bonuses/handlers/GetPublicPostsHandler")

jest.mock("@/models/Bonuses", () => ({
    getPublicPosts: jest.fn()
}))

const postModel = require("@/models/Bonuses")

describe("GetPublicPostsHandler", () => {
    let handler

    beforeEach(() => {
        handler = new GetPublicPostsHandler()
        jest.clearAllMocks()
    })

    test("должен вернуть посты при успешном запросе", async () => {
        const mockPosts = [
            { id: 1, title: "Bonus 1", status: "active" },
            { id: 2, title: "Bonus 2", status: "active" }
        ]

        const settings = { limit: 10, offset: 0 }
        postModel.getPublicPosts.mockResolvedValue(mockPosts)

        const context = {
            settings,
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPosts).toHaveBeenCalledWith(settings)
        expect(result.body).toEqual(mockPosts)
        expect(result.errors).toHaveLength(0)
    })

    test("должен вернуть пустой массив, если постов нет", async () => {
        const settings = { limit: 10, offset: 0 }
        postModel.getPublicPosts.mockResolvedValue([])

        const context = {
            settings,
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPosts).toHaveBeenCalledWith(settings)
        expect(result.body).toEqual([])
        expect(result.errors).toHaveLength(0)
    })

    test("должен вернуть context без изменений, если есть ошибки", async () => {
        const context = {
            settings: { limit: 10, offset: 0 },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPosts).not.toHaveBeenCalled()
        expect(result).toBe(context)
        expect(result.errors).toContain("Предыдущая ошибка")
        expect(result.body).toBeUndefined()
    })

    test("должен добавить ошибку при ошибке базы данных", async () => {
        const dbError = new Error("Database connection failed")
        const settings = { limit: 10, offset: 0 }
        postModel.getPublicPosts.mockRejectedValue(dbError)

        const context = {
            settings,
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPosts).toHaveBeenCalledWith(settings)
        expect(result.errors).toContain("Ошибка при работе с базой: Database connection failed")
        expect(result.body).toBeUndefined()
    })

    test("должен вызвать следующий хендлер, если он установлен", async () => {
        const mockPosts = [{ id: 1, title: "Test" }]
        const settings = { limit: 10, offset: 0 }
        postModel.getPublicPosts.mockResolvedValue(mockPosts)

        const nextHandler = {
            handle: jest.fn().mockResolvedValue({
                settings,
                errors: [],
                body: mockPosts
            })
        }
        handler.setNext(nextHandler)

        const context = {
            settings,
            errors: []
        }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalled()
        expect(result.body).toEqual(mockPosts)
    })

    test("должен передать settings в модель", async () => {
        const settings = { limit: 5, offset: 10, order: "desc" }
        postModel.getPublicPosts.mockResolvedValue([])

        const context = {
            settings,
            errors: []
        }

        await handler.handle(context)

        expect(postModel.getPublicPosts).toHaveBeenCalledWith(settings)
    })
})

