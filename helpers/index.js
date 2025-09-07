const slugify = require("slugify")
class Helper {
  static transliterateUrl(str) {
    return slugify(str, {
      replacement: "-",
      remove: /[*+~.()'"!:@]/g,
      lower: true,
      strict: false,
      trim: true
    })
  }
  static isJsonString(str) {
    try {
      JSON.parse(str)
    } catch {
      return false
    }
    return true
  }
}
module.exports = Helper
