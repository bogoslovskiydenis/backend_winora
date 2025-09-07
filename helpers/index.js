const slugify = require("slugify")
const { decode } = require("html-entities")

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

  static metaSave(data, configEditor) {
    const newData = {}
    for (const key in configEditor) {
      if (key in data) {
        /* prettier-ignore */
        newData[key] = configEditor[key].dataType === 'JSON' ? JSON.stringify(data[key]) : data[key];
      } else {
        /* prettier-ignore */
        newData[key] = configEditor[key].dataType === 'JSON' ? JSON.stringify(configEditor[key].default) : configEditor[key].default;
      }
    }
    return newData
  }

  static metaDecode(data, configEditor) {
    const newData = {}
    for (const key in configEditor) {
      if (key in data) {
        newData[key] =
          configEditor[key].dataType === "JSON"
            ? JSON.parse(data[key])
            : data[key]
      } else {
        newData[key] = configEditor[key].default
      }
    }
    return newData
  }

  static createSchemas(fields, DataTypes) {
    const data = {}
    for (const key in fields) {
      if (Object.hasOwn(fields, key)) {
        data[key] = {}
        for (const keySchemas in fields[key].schemas) {
          if (keySchemas === "type") {
            data[key][keySchemas] = DataTypes[fields[key].schemas[keySchemas]]
          } else {
            data[key][keySchemas] = fields[key].schemas[keySchemas]
          }
        }
      }
    }
    return data
  }

  static isJsonString(str) {
    if (typeof str !== "string") {
      return false
    }
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  static textDecode(text) {
    let newData = text.replace(/<p><\/p>/g, "").trim()
    newData = newData.replace(/<pre class="ql-syntax" spellcheck="false">/g, "")
    newData = newData.replace(/<\/pre>/g, "")
    return decode(newData, { level: "html5" })
  }

  static paginationObject(total, limit, offset) {
    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.floor(offset / limit) + 1
    let previousPage
    if (currentPage === 1) {
      previousPage = null
    } else if (currentPage - 1 > totalPages) {
      previousPage = totalPages
    } else {
      previousPage = currentPage - 1
    }
    return {
      currentPage,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage !== 1,
      nextPage: currentPage + 1 > totalPages ? null : currentPage + 1,
      previousPage
    }
  }

  static validateOrderBy(key, schema) {
    const availableKeys = ["created_at", "id", schema.orderBy]
    return availableKeys.includes(key) ? key : availableKeys[0]
  }

  static validateOrderKey(orderKey) {
    return orderKey && ["DESC", "ASC"].includes(orderKey.toUpperCase())
      ? orderKey
      : "DESC"
  }

  static validateLimits(limit, defaultValue) {
    return limit && Number.isInteger(limit) ? limit : defaultValue
  }

  static validateOffset(offset) {
    return offset && Number.isInteger(offset) ? offset : 0
  }

  static sortingObject(orderBy, orderKey) {
    return {
      orderBy,
      order: orderKey
    }
  }
}
module.exports = Helper
