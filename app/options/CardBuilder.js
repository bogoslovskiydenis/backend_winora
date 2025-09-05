const BaseCardBuilder = require("@/core/BaseCardBuilder")

class CardBuilder extends BaseCardBuilder {
  static mainCard(posts) {
    return posts.map((post) => ({
      key: post.key_id,
      value: this.parse(post.value)
    }))
  }

  static adminCard(posts) {
    return posts.map((post) => {
      const { editor, id, title, value } = post
      return {
        editor,
        id,
        title,
        value
      }
    })
  }

  static adminSingleCard(post) {
    return { ...post, value: this.parse(post.value) }
  }

  static parse(str) {
    try {
      return JSON.parse(str)
    } catch {
      return str
    }
  }

  static update(post) {
    return this.libValidateSave(post)
  }
}
module.exports = CardBuilder
