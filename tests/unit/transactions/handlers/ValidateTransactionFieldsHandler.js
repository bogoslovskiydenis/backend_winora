const ValidateTransactionFieldsHandler = require("../../../../app/transactions/handlers/ValidateTransactionFieldsHandler");

global._AVAILABLE_CURRENCY = ["USDT", "W_TOKEN"];
global._AVAILABLE_NETWORK = {
    USDT: ["ERC20", "TRC20", "BEP20"],
};

describe("ValidateTransactionFieldsHandler", () => {
    let handler;
    let context;

    beforeEach(() => {
        handler = new ValidateTransactionFieldsHandler();
        context = {
            body: {
                userId: 1,
                type: "deposit",
                currency: "USDT",
                network: "ERC20",
                amount: "100",
                status: "pending",
                fee: "5",
            },
            errors: [],
        };
    });

    it("should pass with valid data and call the next handler", async () => {
        const nextHandler = {handle: jest.fn()};
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    it.each(["userId", "type", "currency", "network", "amount"])(`should add an error if required field '%s' is missing`, async (field) => {
        delete context.body[field];

        await handler.handle(context);

        expect(context.errors).toContain(`Поле '${field}' является обязательным`);
    });

    it("should add an error for an invalid transaction type", async () => {
        context.body.type = "invalid_type";

        await handler.handle(context);

        expect(context.errors).toContain(`Недопустимый тип транзакции: '${context.body.type}'`);
    });

    it("should add an error for an invalid transaction status", async () => {
        context.body.status = "invalid_status";

        await handler.handle(context);

        expect(context.errors).toContain(`Недопустимый статус транзакции: '${context.body.status}'`);
    });

    it.each(["0", "-10", "abc"])("should add an error for an invalid amount '%s'", async (amount) => {
        context.body.amount = amount;

        await handler.handle(context);

        expect(context.errors).toContain(`Неверное значение суммы 'amount'`);
    });

    it.each(["-5", "abc"])("should add an error for an invalid fee '%s'", async (fee) => {
        context.body.fee = fee;

        await handler.handle(context);

        expect(context.errors).toContain(`Неверное значение комиссии 'fee'`);
    });

    it("should add an error for a currency that is too long", async () => {
        context.body.currency = "A_VERY_LONG_CURRENCY_NAME";

        await handler.handle(context);

        expect(context.errors).toContain("Поле 'currency' превышает максимально допустимую длину (20)");
    });

    it("should add an error for an unsupported currency", async () => {
        context.body.currency = "XRP";

        await handler.handle(context);

        expect(context.errors).toContain(`Недопустимая валюта 'XRP'. Доступные: ${global._AVAILABLE_CURRENCY.join(", ")}`);
    });

    it("should add an error for a network that is too long", async () => {
        context.body.network = "A_VERY_LONG_NETWORK_NAME_THAT_EXCEEDS_THE_LIMIT_OF_50";

        await handler.handle(context);

        expect(context.errors).toContain(`'Поле 'network' превышает максимально допустимую длину (50)`);
    });

    it("should add an error if no networks are defined for the currency", async () => {
        global._AVAILABLE_NETWORK.BTC = []; // Temporarily add a currency with no networks
        context.body.currency = "BTC";

        await handler.handle(context);

        expect(context.errors).toContain("Для валюты 'BTC' не заданы доступные сети");
        delete global._AVAILABLE_NETWORK.BTC;
    });

    it("should add an error for an invalid network for the given currency", async () => {
        context.body.network = "Solana";

        await handler.handle(context);

        const availableNetworks = global._AVAILABLE_NETWORK[context.body.currency.toUpperCase()];
        expect(context.errors).toContain(`Недопустимая сеть 'Solana' для валюты 'USDT'. Доступные: ${availableNetworks.join(", ")}`);
    });

    it("should not validate network for W_TOKEN", async () => {
        context.body.currency = "W_TOKEN";
        context.body.network = "any_network";
        const nextHandler = {handle: jest.fn()};
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(context.errors.length).toBe(0);
        expect(nextHandler.handle).toHaveBeenCalled();
    });

    it("should not call the next handler if there are errors", async () => {
        context.errors.push("An existing error");
        const nextHandler = {handle: jest.fn()};
        handler.setNext(nextHandler);

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});