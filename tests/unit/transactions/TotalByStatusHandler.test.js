require("module-alias/register")
require("@/config")
const TotalByStatusHandler = require('@/app/transactions/handlers/TotalByStatusHandler');

describe('TotalByStatusHandler - Black Box Tests', () => {
    let handler;

    beforeEach(() => {
        handler = new TotalByStatusHandler();
    });

    test('✅ должен обрабатывать валидный контекст без ошибок', async () => {
        const context = {
            settings: { url: 'pending' },
            body: {},
            errors: [],
        };

        const result = await handler.handle(context);

        expect(result).toBeDefined();
        expect(result.body).toBeDefined();
        expect(result.errors).toBeDefined();
    });

    test('✅ должен пропускать обработку при наличии ошибок', async () => {
        const context = {
            settings: { url: 'pending' },
            body: {},
            errors: ['Предыдущая ошибка'],
        };

        const result = await handler.handle(context);

        expect(result.errors).toContain('Предыдущая ошибка');
        expect(result.errors).toHaveLength(1);
    });

    test('✅ должен обрабатывать различные статусы', async () => {
        const statuses = ['pending', 'confirmed', 'failed', 'processing', 'canceled'];
        
        for (const status of statuses) {
            const context = {
                settings: { url: status },
                body: {},
                errors: [],
            };

            const result = await handler.handle(context);

            expect(result).toBeDefined();
            expect(result.body).toBeDefined();
            expect(result.errors).toBeDefined();
        }
    });

    test('✅ должен обрабатывать пустые настройки', async () => {
        const context = {
            settings: {},
            body: {},
            errors: [],
        };

        const result = await handler.handle(context);

        expect(result).toBeDefined();
        expect(result.body).toBeDefined();
        expect(result.errors).toBeDefined();
    });

    test('✅ должен обрабатывать отсутствующие настройки', async () => {
        const context = {
            body: {},
            errors: [],
        };

        // Ожидаем ошибку, так как хендлер пытается деструктурировать undefined
        await expect(handler.handle(context)).rejects.toThrow();
    });

    test('✅ должен вызывать следующий обработчик при успешной обработке', async () => {
        const nextHandler = {
            handle: jest.fn(),
        };
        handler.setNext(nextHandler);

        const context = {
            settings: { url: 'pending' },
            body: {},
            errors: [],
        };

        await handler.handle(context);

        expect(nextHandler.handle).toHaveBeenCalledWith(context);
    });

    test('❌ не должен вызывать следующий обработчик при наличии ошибок', async () => {
        const nextHandler = {
            handle: jest.fn(),
        };
        handler.setNext(nextHandler);

        const context = {
            settings: { url: 'pending' },
            body: {},
            errors: ['Предыдущая ошибка'],
        };

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});
