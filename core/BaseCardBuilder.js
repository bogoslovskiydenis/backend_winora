class CardBuilder {
  static singleAdminCategory(post) {
    if (!post) return null
    return Object.assign(
      this.commonAdminDecode(post),
      this.categoryMetaDecode(post),
      { content: post.content }
    )
  }

  static commonDecode(post) {
    return {
      id: post.id,
      permalink: `${_SLUG_LANG[post.lang]}/${post.slug}/${post.permalink}`,
      title: post.title,
      status: post.status,
      thumbnail: post.thumbnail,
      short_desc: post.short_desc,
      h1: post.h1,
      meta_title: post.meta_title,
      description: post.description,
      keywords: post.keywords,
      lang: post.lang,
      updated_at: post.updated_at,
      created_at: post.created_at
    }
  }
  static commonAdminDecode(post) {
    return Object.assign(this.commonDecode(post), {
      permalink: post.permalink,
      content: post.content
    })
  }
  static categoryMetaDecode(post) {
    return this.parse(post.faq)
  }
  static libValidateSave(post) {
    const newData = {
      id: post.id
    }
    if (_CONFIG_EDITOR.TEXT_DECODE.includes(post.editor)) {
      newData.value = this.textValidate(post.value)
    } else if (_CONFIG_EDITOR.JSON_DECODE.includes(post.editor)) {
      newData.value =
        post.value === "" ? JSON.stringify({}) : JSON.stringify(post.value)
    }
    return newData
  }
  static textValidate(text) {
    return text.replace(/<p><\/p>/g, "").trim()
  }

  static getTitles(arr) {
    return arr.map((item) => item.title)
  }
  static parse(str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      return str
    }
  }
}
module.exports = CardBuilder
