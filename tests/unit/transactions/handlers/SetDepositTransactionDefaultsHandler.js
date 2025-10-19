const SetDepositTransactionDefaultsHandler = require("../../../../app/transactions/handlers/SetDepositTransactionDefaultsHandler");

describe("SetDepositTransactionDefaultsHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new SetDepositTransactionDefaultsHandler();
        context = {
            body: {},
            errors: [],
        };
    });

    it("should set default values for a deposit transaction and call the next handler", async () => {
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.body).toEqual({
            type: "deposit",
            status: "pending",
            fee: 0,
            is_manual: false,
            tx_hash: null,
            from_address: "",
            to_address: "",
            explorer_url: "",
            internal_comment: "",
            user_comment: "",
        });
        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it("should not overwrite existing fee value", async () => {
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);
        context.body.fee = 10;

        await handler.handle(context);

        expect(context.body.fee).toBe(10);
    });

    it("should not call the next handler if there are errors", async () => {
        context.errors.push("An error occurred");
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});
