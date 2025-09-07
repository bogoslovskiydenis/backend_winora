// eslint.config.cjs
const js = require("@eslint/js")
const globals = require("globals")

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "tests/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        _APP_DIR: "readonly",
        _PORT: "readonly",
        _IP: "readonly",
        _LANG: "readonly",
        _THUMBNAIL: "readonly",
        _API_URL: "readonly",
        _EMAIL: "readonly",
        _FRONT_DOMAIN: "readonly",
        _GMAIL_KEY: "readonly",
        _LANG_ID: "readonly",
        _SLUG_LANG: "readonly",
        _CONFIG_EDITOR: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: "off",
      quotes: ["error", "double"],
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
    }
  }
]
