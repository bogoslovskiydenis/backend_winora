function createResponse(response) {
  return response
    ? {
        status: "ok",
        body: response
      }
    : {
        status: "error"
      }
}

module.exports = { createResponse }
