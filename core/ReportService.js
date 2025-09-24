const XLSX = require("xlsx")

class ReportService {
  constructor(basePath = "./public/reports/") {
    this.xlsx = XLSX
    this.basePath = basePath
  }
  async report(data, fileName) {
    if (!data || !fileName) return
    const workBook = this.xlsx.utils.book_new()
    for (let key in data) {
      const currentData = this.xlsx.utils.json_to_sheet(data[key])
      this.xlsx.utils.book_append_sheet(workBook, currentData, key)
    }
    this.xlsx.writeFile(workBook, `${this.basePath}${fileName}`)
    return `${this.basePath}${fileName}`.replace(".", "")
  }
}
module.exports = ReportService
