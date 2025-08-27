const slugify = require("slugify")
const { decode } = require("html-entities")
class Helper {
  static isJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }
}
module.exports = Helper
