require("module-alias/register")
require("@/config")
const TrimFieldsHandler = require("@/handlers/TrimFieldsHandler")

describe("TrimFieldsHandler", () => {
    test("обрезает указанные строковые поля", async () => {
        const handler = new TrimFieldsHandler(["title", "description"])
        const context = {
            body: {
                title: "  Hello  ",
                description: "  World  ",
                other: " untouched "
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.title).toBe("Hello")
        expect(result.body.description).toBe("World")
        expect(result.body.other).toBe(" untouched ")
    })

    test("игнорирует нестроковые значения", async () => {
        const handler = new TrimFieldsHandler(["count", "active"])
        const context = {
            body: {
                count: 42,
                active: false,
                nested: { value: "  test  " }
            },
            errors: []
        }

        const result = await handler.handle(context)

        expect(result.body.count).toBe(42)
        expect(result.body.active).toBe(false)
        expect(result.body.nested.value).toBe("  test  ")
    })

    test("добавляет ошибку, если body отсутствует", async () => {
        const handler = new TrimFieldsHandler(["title"])
        const context = { errors: [] }

        const result = await handler.handle(context)

        expect(result).toBe(context)
        expect(result.errors).toContain("Данные для обработки не найдены")
    })

    test("не выполняет обработку, если уже есть ошибки", async () => {
        const handler = new TrimFieldsHandler(["title"])
        const context = {
            body: { title: "  test  " },
            errors: ["existing error"]
        }

        const result = await handler.handle(context)

        expect(result.body.title).toBe("  test  ")
        expect(result.errors).toContain("existing error")
    })

    test("передает context в следующий хендлер", async () => {
        const handler = new TrimFieldsHandler(["title"])
        const nextHandler = {
            handle: jest.fn().mockResolvedValue({ forwarded: true })
        }
        handler.setNext(nextHandler)

        const context = {
            body: { title: "  spaced  " },
            errors: []
        }

        const result = await handler.handle(context)

        expect(context.body.title).toBe("spaced")
        expect(nextHandler.handle).toHaveBeenCalledWith(context)
        expect(result).toEqual({ forwarded: true })
    })
})


