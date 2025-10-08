// src/config/postFields.js

module.exports = {
  requiredFields: [
    "title",
    "subTitle",
    "image",
    "depositAmount",
    "order",
    "status"
  ],
  fieldTypes: {
    title: "string",
    subTitle: "string",
    image: "string",
    depositAmount: "number",
    order: "number",
    status: "string"
  },
  constraints: {
    title: { min: 3, max: 150 },
    subTitle: { max: 250 },
    image: { max: 300 },
    status: ["public", "hide", "basket"]
  }
}
