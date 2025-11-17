require("module-alias/register")
require("@/config")
const GetPublicPostByIdHandler = require("@/app/bonuses/handlers/GetPublicPostByIdHandler")

jest.mock("@/models/Bonuses", () => ({
    getPublicPostById: jest.fn()
}))

const postModel = require("@/models/Bonuses")

describe("GetPublicPostByIdHandler", () => {
    let handler

    beforeEach(() => {
        handler = new GetPublicPostByIdHandler()
        jest.clearAllMocks()
    })

    test("должен вернуть пост, если он найден", async () => {
        const mockPost = {
            id: 1,
            title: "Test Bonus",
            subTitle: "Test Subtitle",
            status: "active"
        }

        postModel.getPublicPostById.mockResolvedValue(mockPost)

        const context = {
            data: { id: 1 },
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPostById).toHaveBeenCalledWith(1)
        expect(result.body).toEqual(mockPost)
        expect(result.errors).toHaveLength(0)
    })

    test("должен добавить ошибку, если пост не найден", async () => {
        postModel.getPublicPostById.mockResolvedValue(null)

        const context = {
            data: { id: 999 },
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPostById).toHaveBeenCalledWith(999)
        expect(result.body).toBeUndefined()
        expect(result.errors).toContain("Пост с таким id не существует")
    })

    test("должен вернуть context без изменений, если есть ошибки", async () => {
        const context = {
            data: { id: 1 },
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPostById).not.toHaveBeenCalled()
        expect(result).toBe(context)
        expect(result.errors).toContain("Предыдущая ошибка")
    })

    test("должен добавить ошибку при ошибке базы данных", async () => {
        const dbError = new Error("Database connection failed")
        postModel.getPublicPostById.mockRejectedValue(dbError)

        const context = {
            data: { id: 1 },
            errors: []
        }

        const result = await handler.handle(context)

        expect(postModel.getPublicPostById).toHaveBeenCalledWith(1)
        expect(result.errors).toContain("Ошибка при работе с базой: Database connection failed")
        expect(result.body).toBeUndefined()
    })

    test("должен вызвать следующий хендлер, если он установлен", async () => {
        const mockPost = { id: 1, title: "Test" }
        postModel.getPublicPostById.mockResolvedValue(mockPost)

        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ data: { id: 1 }, errors: [], body: mockPost })
        }
        handler.setNext(nextHandler)

        const context = {
            data: { id: 1 },
            errors: []
        }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalled()
        expect(result.body).toEqual(mockPost)
    })
})

