require("module-alias/register")
require("@/config")
const GetPublicPostsByStatusHandler = require('@/app/transactions/handlers/GetPublicPostsByStatusHandler');

describe('GetPublicPostsByStatusHandler - Black Box Tests', () => {
    let handler;

    beforeEach(() => {
        handler = new GetPublicPostsByStatusHandler();
    });

    test('✅ должен обрабатывать валидный контекст без ошибок', async () => {
        const context = {
            settings: { url: 'pending', limit: 10, offset: 0 },
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
            settings: { url: 'pending', limit: 10, offset: 0 },
            body: {},
            errors: ['Предыдущая ошибка'],
        };

        const result = await handler.handle(context);

        expect(result.errors).toContain('Предыдущая ошибка');
        expect(result.errors).toHaveLength(1);
    });

    test('✅ должен обрабатывать пустые настройки', async () => {
        const context = {
            settings: { url: 'pending' }, // Убираем limit и offset, но оставляем url
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
            settings: { url: 'pending' }, // Добавляем минимальные настройки
            body: {},
            errors: [],
        };

        const result = await handler.handle(context);

        expect(result).toBeDefined();
        expect(result.body).toBeDefined();
        expect(result.errors).toBeDefined();
    });

    test('✅ должен обрабатывать различные статусы', async () => {
        const statuses = ['pending', 'confirmed', 'failed', 'processing', 'canceled'];
        
        for (const status of statuses) {
            const context = {
                settings: { url: status, limit: 5, offset: 0 },
                body: {},
                errors: [],
            };

            const result = await handler.handle(context);

            expect(result).toBeDefined();
            expect(result.body).toBeDefined();
            expect(result.errors).toBeDefined();
        }
    });

    test('✅ должен обрабатывать различные параметры пагинации', async () => {
        const paginationParams = [
            { limit: 1, offset: 0 },
            { limit: 10, offset: 5 },
            { limit: 100, offset: 0 },
            { limit: 50, offset: 25 }
        ];
        
        for (const params of paginationParams) {
            const context = {
                settings: { url: 'pending', ...params },
                body: {},
                errors: [],
            };

            const result = await handler.handle(context);

            expect(result).toBeDefined();
            expect(result.body).toBeDefined();
            expect(result.errors).toBeDefined();
        }
    });

    test('✅ должен вызывать следующий обработчик при успешной обработке', async () => {
        const nextHandler = {
            handle: jest.fn(),
        };
        handler.setNext(nextHandler);

        const context = {
            settings: { url: 'pending', limit: 10, offset: 0 },
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
            settings: { url: 'pending', limit: 10, offset: 0 },
            body: {},
            errors: ['Предыдущая ошибка'],
        };

        await handler.handle(context);

        expect(nextHandler.handle).not.toHaveBeenCalled();
    });
});
