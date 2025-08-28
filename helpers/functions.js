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
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}
function validateMinLength(str, minLength) {
  return typeof str === "string" && str.length >= minLength
}
module.exports = { createResponse, validateEmail, validateMinLength }
