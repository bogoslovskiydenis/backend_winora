const TrimTransactionFieldsHandler = require("../../../../app/transactions/handlers/TrimTransactionFieldsHandler");

describe("TrimTransactionFieldsHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new TrimTransactionFieldsHandler();
        context = {
            body: {
                currency: "  USD  ",
                network: "  ERC20  ",
                from_address: "  0x123  ",
                to_address: "  0x456  ",
                explorer_url: "  https://etherscan.io/  ",
                internal_comment: "  Internal comment  ",
                user_comment: "  User comment  ",
                amount: 100,
            },
            errors: [],
        };
    });

    it("should trim specified string fields and call the next handler", async () => {
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.body).toEqual({
            currency: "USD",
            network: "ERC20",
            from_address: "0x123",
            to_address: "0x456",
            explorer_url: "https://etherscan.io/",
            internal_comment: "Internal comment",
            user_comment: "User comment",
            amount: 100,
        });
        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it("should not modify non-string fields", async () => {
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.body.amount).toBe(100);
    });

    it("should not call the next handler if there are errors", async () => {
        context.errors.push("An error occurred");
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});
