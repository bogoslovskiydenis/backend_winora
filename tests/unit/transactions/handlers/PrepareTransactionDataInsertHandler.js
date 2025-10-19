const PrepareTransactionDataInsertHandler = require("../../../../app/transactions/handlers/PrepareTransactionDataInsertHandler");

describe("PrepareTransactionDataInsertHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new PrepareTransactionDataInsertHandler();
        context = {
            body: {
                userId: 1,
                type: "deposit",
                status: "pending",
                currency: "USD",
                network: "ERC20",
                amount: "100",
                fee: "5",
                is_manual: true,
                tx_hash: "0x123",
                from_address: "0x456",
                to_address: "0x789",
                explorer_url: "https://etherscan.io/",
                internal_comment: "Internal comment",
                user_comment: "User comment",
            },
            errors: [],
        };
    });

    it("should prepare transaction data and call the next handler", async () => {
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.prepareData).toEqual({
            user_id: 1,
            type: "deposit",
            status: "pending",
            currency: "USD",
            network: "ERC20",
            amount: 100,
            fee: 5,
            is_manual: true,
            tx_hash: "0x123",
            from_address: "0x456",
            to_address: "0x789",
            explorer_url: "https://etherscan.io/",
            internal_comment: "Internal comment",
            user_comment: "User comment",
        });
        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it("should not call the next handler if there are errors", async () => {
        context.errors.push("An error occurred");
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.prepareData).toBeUndefined();
        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});
