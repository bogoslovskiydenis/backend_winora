require("module-alias/register")
require("@/config")
const GetPostsHandler = require("@/app/bonuses/handlers/GetPostsHandler")

jest.mock("@/models/Bonuses", () => ({
    getPosts: jest.fn()
}))

const postModel = require("@/models/Bonuses")

describe("GetPostsHandler", () => {
    let handler

    beforeEach(() => {
        handler = new GetPostsHandler()
        jest.clearAllMocks()
    })

    test("возвращает посты при успешном запросе", async () => {
        const mockPosts = [
            { id: 1, title: "Bonus 1" },
            { id: 2, title: "Bonus 2" }
        ]
        const settings = { limit: 10, offset: 0 }
        postModel.getPosts.mockResolvedValue(mockPosts)

        const context = { settings, errors: [] }
        const result = await handler.handle(context)

        expect(postModel.getPosts).toHaveBeenCalledWith(settings)
        expect(result.body).toEqual(mockPosts)
        expect(result.errors).toHaveLength(0)
    })

    test("возвращает context без изменений при существующих ошибках", async () => {
        const context = {
            settings: { limit: 10, offset: 0 },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(postModel.getPosts).not.toHaveBeenCalled()
        expect(result).toBe(context)
        expect(result.errors).toContain("Предыдущая ошибка")
        expect(result.body).toBeUndefined()
    })

    test("возвращает пустой массив, если постов нет", async () => {
        const settings = { limit: 5, offset: 5 }
        postModel.getPosts.mockResolvedValue([])

        const context = { settings, errors: [] }
        const result = await handler.handle(context)

        expect(postModel.getPosts).toHaveBeenCalledWith(settings)
        expect(result.body).toEqual([])
        expect(result.errors).toHaveLength(0)
    })

    test("добавляет ошибку при ошибке базы данных", async () => {
        const dbError = new Error("Database connection failed")
        const settings = { limit: 10, offset: 0 }
        postModel.getPosts.mockRejectedValue(dbError)

        const context = { settings, errors: [] }
        const result = await handler.handle(context)

        expect(postModel.getPosts).toHaveBeenCalledWith(settings)
        expect(result.errors).toContain("Ошибка при работе с базой: Database connection failed")
        expect(result.body).toBeUndefined()
    })

    test("передает context в следующий хендлер", async () => {
        const mockPosts = [{ id: 1, title: "Test" }]
        const settings = { limit: 10, offset: 0 }
        postModel.getPosts.mockResolvedValue(mockPosts)

        const nextHandler = {
            handle: jest.fn().mockResolvedValue({
                settings,
                errors: [],
                body: mockPosts
            })
        }
        handler.setNext(nextHandler)

        const context = { settings, errors: [] }
        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result.body).toEqual(mockPosts)
    })

    test("сохраняет исходный контекст при успешном выполнении", async () => {
        const mockPosts = [{ id: 1 }]
        const settings = { limit: 1, offset: 0 }
        postModel.getPosts.mockResolvedValue(mockPosts)

        const context = { settings, errors: [], total: 0 }
        const result = await handler.handle(context)

        expect(result.body).toEqual(mockPosts)
        expect(result.total).toBe(0)
    })
})


