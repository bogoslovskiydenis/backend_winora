module.exports = class ParsString {
  static parseSitemap(strHTML) {
    const arrString = strHTML.split("<loc>")
    arrString.shift()
    const listUrl = arrString.map((str) => str.split("</loc>").shift())
    return listUrl
  }
  static parsLoadAjaxContent(strHTML) {
    const arrString = strHTML.split('load_ajax_content("')
    return arrString.length > 1 ? arrString[1].split('"')[0] : ""
  }
}
