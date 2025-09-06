module.exports = {
  testEnvironment: "node", // важно для Express/Knex
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1" // алиас @/ → корень проекта
  },
  testMatch: ["**/tests/**/*.test.js"] // чтобы Jest видел все тесты
}
