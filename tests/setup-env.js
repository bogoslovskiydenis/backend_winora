const path = require('path')

// Загружаем .env файл
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})

// Устанавливаем глобальные переменные как в config/index.js
global._PORT = process.env.PORT || 3010
global._IP = process.env.IP || 'localhost'
global._API_URL = process.env.API_URL || 'http://localhost:3010'
global._FRONT_DOMAIN = process.env.FRONT_DOMAIN || 'http://localhost:3000'
global._APP_DIR = path.resolve(__dirname, '../app')
global._EMAIL = process.env.EMAIL
global._GMAIL_KEY = process.env.GMAIL_KEY
global._THUMBNAIL = process.env.THUMBNAIL || '/img/default.jpg'

// Языки
global._LANG = {
    1: 'ua',
    2: 'en'
}
global._LANG_ID = {
    ua: 1,
    en: 2,
    ru: 1
}
global._SLUG_LANG = {
    1: 'ua',
    2: 'en'
}

// Конфиг редактора (если нужен)
global._CONFIG_EDITOR = {
    TEXT_DECODE: ['text', 'textarea'],
    JSON_DECODE: ['image', 'array', 'select', 'checkbox']
}

// Тестовые данные
global.testConfig = {
    testUserId: 11,
    testUserEmail: 'test_user@gmail.com',
    testUserPassword: '212007rf',
    testUserLogin: 'test_user'
}