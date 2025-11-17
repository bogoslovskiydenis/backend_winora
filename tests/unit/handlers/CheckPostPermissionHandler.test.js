require("module-alias/register")
require("@/config")
const CheckPostPermissionHandler = require("@/handlers/CheckPostPermissionHandler")
const AdminUsers = require("@/models/AdminUsers")

jest.mock("@/models/AdminUsers")

describe("CheckPostPermissionHandler", () => {
    let handler
    let getUserByIdMock

    beforeEach(() => {
        getUserByIdMock = jest.fn()
        AdminUsers.mockImplementation(() => ({
            getUserById: getUserByIdMock
        }))
        handler = new CheckPostPermissionHandler(["super_admin", "fin_admin"])
        jest.clearAllMocks()
    })

    test("пропускает обработку при отсутствии ошибок и валидной роли", async () => {
        getUserByIdMock.mockResolvedValue({
            id: 1,
            role: "fin_admin"
        })

        const context = {
            editorId: 1,
            errors: []
        }

        const result = await handler.handle(context)

        expect(getUserByIdMock).toHaveBeenCalledWith(1)
        expect(result.errors).toHaveLength(0)
    })

    test("возвращает ошибку, если editorId не передан", async () => {
        const context = {
            errors: []
        }

        const result = await handler.handle(context)

        expect(getUserByIdMock).not.toHaveBeenCalled()
        expect(result.errors).toContain("Пользователь не авторизован")
    })

    test("возвращает ошибку, если пользователь не найден", async () => {
        getUserByIdMock.mockResolvedValue(null)

        const context = {
            editorId: 5,
            errors: []
        }

        const result = await handler.handle(context)

        expect(getUserByIdMock).toHaveBeenCalledWith(5)
        expect(result.errors).toContain("Пользователь не авторизован")
    })

    test("возвращает ошибку, если роль отсутствует или не разрешена", async () => {
        getUserByIdMock.mockResolvedValue({
            id: 2,
            role: "viewer"
        })

        const context = {
            editorId: 2,
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.errors).toContain("У вас нет прав на редактирование этой записи")
    })

    test("не вызывает базу, если уже есть ошибки", async () => {
        const context = {
            editorId: 1,
            errors: ["Предыдущая ошибка"]
        }

        const result = await handler.handle(context)

        expect(getUserByIdMock).not.toHaveBeenCalled()
        expect(result.errors).toContain("Предыдущая ошибка")
        expect(result).toBe(context)
    })

    test("прокидывает context в следующий хендлер", async () => {
        getUserByIdMock.mockResolvedValue({
            id: 1,
            role: "super_admin"
        })

        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ handledByNext: true })
        }
        handler.setNext(nextHandler)

        const context = {
            editorId: 1,
            errors: []
        }

        const result = await handler.handle(context)

        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result).toEqual({ handledByNext: true })
    })
})


