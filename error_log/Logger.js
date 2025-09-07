const fs = require("fs");
const path = require("path");

class ErrorLogger {
  static async store(error) {
    try {
      const now = new Date();
      const currentTimeStamp = new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
        .format(now)
        .replace(/\./g, "-")
        .replace(", ", "_")
        .replace(/:/g, "_");

      const dir = path.join("./error_log/errors", currentTimeStamp.slice(0, -9));

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const errorText = error.stack || error.toString();
      fs.writeFileSync(
        path.join(dir, `${currentTimeStamp.slice(11)}.txt`),
        errorText
      );
    } catch (err) {
      console.error("ErrorLogger.store failed:", err);
    }
  }
}

module.exports = ErrorLogger;
