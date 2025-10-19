const InsertDepositTransactionHandler = require("../../../../app/transactions/handlers/InsertDepositTransactionHandler");
const transactionModel = require("../../../../models/Transactions");

jest.mock("../../../../models/Transactions");

describe("InsertDepositTransactionHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new InsertDepositTransactionHandler();
        context = {
            prepareData: { amount: 100, currency: "USD" },
            errors: [],
        };
        transactionModel.store = jest.fn();
    });

    it("should insert a transaction and set insertId on success", async () => {
        const insertId = 123;
        transactionModel.store.mockResolvedValue({ id: insertId });
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(transactionModel.store).toHaveBeenCalledWith(context.prepareData);
        expect(context.insertId).toBe(insertId);
        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it("should not call the next handler if there are errors", async () => {
        context.errors.push("An error occurred");
        const nextHandler = { handle: jest.fn() };
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(transactionModel.store).not.toHaveBeenCalled();
        expect(nextHandler.handle).not.toHaveBeenCalled();
    });

    it("should add an error if there is a database error", async () => {
        const errorMessage = "Database connection failed";
        transactionModel.store.mockRejectedValue(new Error(errorMessage));

        await handler.handle(context);

        expect(context.errors).toContain(`Ошибка при работе с базой: ${errorMessage}`);
    });
});
