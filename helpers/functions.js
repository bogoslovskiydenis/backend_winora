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
function diffObjects(new_value, old_value) {
  const diff = []
  for (let key in new_value) {
    if (new_value.hasOwnProperty(key) && new_value[key] !== old_value[key]) {
      diff.push({
        old_value: old_value[key],
        new_value: new_value[key],
        field: key
      })
    }
  }
  return diff
}
module.exports = {
  createResponse,
  validateEmail,
  validateMinLength,
  diffObjects
}
