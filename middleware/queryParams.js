function queryParams(req, res, next) {
  req.queryParams = {}
  if (req.query.limit) {
    const param = Number(req.query.limit)
    if (Number.isInteger(param)) req.queryParams.limit = param
  }
  if (req.query.offset) {
    const param = Number(req.query.offset)
    if (Number.isInteger(param)) req.queryParams.offset = param
  }
  if (req.query.orderBy) {
    req.queryParams.orderBy = req.query.orderBy
  } else {
    req.queryParams.orderBy = "created_at"
  }
  if (req.query.orderKey) {
    if (["DESC", "ASC"].includes(req.query.orderKey.toUpperCase())) {
      req.queryParams.orderKey = req.query.orderKey.toUpperCase()
    } else {
      req.queryParams.orderKey = "DESC"
    }
  } else {
    req.queryParams.orderKey = "DESC"
  }
  next()
}

module.exports = queryParams
