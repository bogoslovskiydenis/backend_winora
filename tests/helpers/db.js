const knex = require('@/db')

class TestDBHelper {
    static async cleanupTestData() {
        // Очистка тестовых данных после тестов
        await knex('transactions').where('user_id', '>', 1000).del()
        await knex('investments').where('user_id', '>', 1000).del()
    }

    static async createTestUser(overrides = {}) {
        const [id] = await knex('front_users').insert({
            login: `test_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'test_hash',
            role: 'user',
            ...overrides
        })
        return id
    }

    static async createTestInvestment(userId, overrides = {}) {
        const [id] = await knex('investments').insert({
            user_id: userId,
            principal_amount: 1000,
            strategy_type: 'GAMBLING',
            status: 'active',
            ...overrides
        })
        return id
    }
}

module.exports = TestDBHelper