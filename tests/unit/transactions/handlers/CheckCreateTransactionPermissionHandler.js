const CheckCreateTransactionPermissionHandler = require("../../../../app/transactions/handlers/CheckCreateTransactionPermissionHandler");
const FrontUsers = require("../../../../models/FrontUsers");

jest.mock("../../../../models/FrontUsers");

describe("CheckCreateTransactionPermissionHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new CheckCreateTransactionPermissionHandler();
        context = {
            body: {
                userId: 1,
                session: "session-token",
            },
            errors: [],
        };
        FrontUsers.prototype.checkSession = jest.fn();
    });

    it("should call the next handler if the user is authorized", async () => {
        FrontUsers.prototype.checkSession.mockResolvedValue({ role: "user" });
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it("should add an error if userId is not provided", async () => {
        delete context.body.userId;

        await handler.handle(context);

        expect(context.errors).toContain("userId не указан");
    });

    it("should add an error if session is not provided", async () => {
        delete context.body.session;

        await handler.handle(context);

        expect(context.errors).toContain("session не указан");
    });

    it("should add an error if the user is not authorized", async () => {
        FrontUsers.prototype.checkSession.mockResolvedValue(null);

        await handler.handle(context);

        expect(context.errors).toContain("Пользователь не авторизован");
    });

    it("should add an error if the user role is not 'user'", async () => {
        FrontUsers.prototype.checkSession.mockResolvedValue({ role: "admin" });

        await handler.handle(context);

        expect(context.errors).toContain("У вас нет прав на редактирование этой записи");
    });

    it("should add an error if there is a database error", async () => {
        const errorMessage = "Database connection failed";
        FrontUsers.prototype.checkSession.mockRejectedValue(new Error(errorMessage));

        await handler.handle(context);

        expect(context.errors).toContain(`Ошибка при работе с базой: ${errorMessage}`);
    });
});
