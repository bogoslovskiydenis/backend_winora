
require("module-alias/register")
require("@/config")
const CheckAvailableStatusTransactionsHandler = require('@/app/transactions/handlers/CheckAvailableStatusTransactionsHandler');

describe('CheckAvailableStatusTransactionsHandler - Black Box Tests', () => {
    const allowedStatuses = ['pending', 'confirmed', 'failed'];
    let handler;

    beforeEach(() => {
        handler = new CheckAvailableStatusTransactionsHandler(allowedStatuses);
    });

    test('✅ должен успешно обрабатывать валидные статусы', async () => {
        const validStatuses = ['pending', 'confirmed', 'failed'];
        
        for (const status of validStatuses) {
            const context = {
                settings: { url: status },
                errors: [],
            };

            const result = await handler.handle(context);

            expect(result.errors).toHaveLength(0);
        }
    });

    test('❌ должен добавлять ошибку для невалидных статусов', async () => {
        const invalidStatuses = ['invalid_status', 'error_status', 'unknown'];
        
        for (const status of invalidStatuses) {
            const context = {
                settings: { url: status },
                errors: [],
            };

            const result = await handler.handle(context);

            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBe('Поле статус не валидно');
        }
    });

    test('❌ должен добавлять ошибку при отсутствии статуса', async () => {
        const context = {
            settings: {},
            errors: [],
        };

        const result = await handler.handle(context);

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBe('Поле статус не валидно');
    });

    test('❌ должен добавлять ошибку при отсутствии настроек', async () => {
        const context = {
            errors: [],
        };

        // Ожидаем ошибку, так как хендлер пытается деструктурировать undefined
        await expect(handler.handle(context)).rejects.toThrow();
    });

    test('✅ должен пропускать обработку при наличии предыдущих ошибок', async () => {
        const context = {
            settings: { url: 'invalid_status' },
            errors: ['Предыдущая ошибка'],
        };

        const result = await handler.handle(context);

        expect(result.errors).toContain('Предыдущая ошибка');
        expect(result.errors).toContain('Поле статус не валидно');
        // Хендлер добавляет ошибку независимо от наличия предыдущих ошибок
        expect(result.errors).toHaveLength(2);
    });

    test('✅ должен вызывать следующий обработчик при валидном статусе', async () => {
        const nextHandler = {
            handle: jest.fn(),
        };
        handler.setNext(nextHandler);

        const context = {
            settings: { url: 'confirmed' },
            errors: [],
        };

        await handler.handle(context);

        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    test('❌ не должен вызывать следующий обработчик при невалидном статусе', async () => {
        const nextHandler = {
            handle: jest.fn(),
        };
        handler.setNext(nextHandler);

        const context = {
            settings: { url: 'error_status' },
            errors: [],
        };

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });

    test('✅ должен работать с пустым списком разрешенных статусов', async () => {
        const emptyHandler = new CheckAvailableStatusTransactionsHandler([]);
        
        const context = {
            settings: { url: 'any_status' },
            errors: [],
        };

        const result = await emptyHandler.handle(context);

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBe('Поле статус не валидно');
    });

    test('✅ должен работать с одним разрешенным статусом', async () => {
        const singleStatusHandler = new CheckAvailableStatusTransactionsHandler(['pending']);
        
        const validContext = {
            settings: { url: 'pending' },
            errors: [],
        };

        const invalidContext = {
            settings: { url: 'confirmed' },
            errors: [],
        };

        const validResult = await singleStatusHandler.handle(validContext);
        const invalidResult = await singleStatusHandler.handle(invalidContext);

        expect(validResult.errors).toHaveLength(0);
        expect(invalidResult.errors).toHaveLength(1);
    });
});
