const SettingsModelKnex = require("@/models/SettingsKnex")
const CardBuilder = require("@/app/settings/CardBuilder")
const mainSchema = require("@/schemas/settings")
class Service {
  constructor() {
    this.schema = mainSchema
    this.model = new SettingsModelKnex(mainSchema)
  }
  async getPosts(lang) {
    const optionsModel = new SettingsModelKnex(this.schema)
    const posts = await optionsModel.getPosts(lang)
    const data = CardBuilder.mainCard(posts)
    const response = {
      header: [],
      footer: {
        socials: [],
        seoText: "",
        menu: [],
        content: ""
      }
    }
    data.forEach((item) => {
      if (item.key === "header_menu_main") {
        response.header = item.value.map((currentItem, index) => {
          return {
            id: index + 1,
            icon: currentItem.value_4,
            title: currentItem.value_1,
            link: currentItem.value_2,
            onlyMobile: Boolean(currentItem.value_3)
          }
        })
      } else if (item.key === "footer_menu_main") {
        response.footer.menu = item.value.map((currentItem, index) => {
          return {
            id: index + 1,
            title: currentItem.value_1,
            link: currentItem.value_2
          }
        })
      } else if (item.key === "footer_text") {
        response.footer.seoText = item.value
      } else if (item.key === "social") {
        response.footer.socials = item.value.map((currentItem, index) => {
          return {
            id: index + 1,
            name: currentItem.value_3,
            link: currentItem.value_2
          }
        })
      } else if (item.key === "bonusBanner") {
        response[item.key] = {
          timeEnd: item.value.timeEnd,
          backgroundImg: item.value.src,
          subTitle: item.value.subTitle,
          title: item.value.title,
          tags: item.value.tags,
          link: item.value.link,
          hide: Boolean(item.value.hide)
        }
      } else if (item.key === "footer_content") {
        response.footer.content = item.value
      }
    })
    return response
  }
  async indexAdmin(lang) {
    return CardBuilder.adminCard(await this.model.indexAdmin(lang))
  }
  async getPostById(id) {
    return CardBuilder.adminSingleCard(await this.model.getPostById(id))
  }
  async update(data) {
    const response = {
      status: "ok",
      body: []
    }
    await this.model.update(CardBuilder.update(data), data.id)
    return response
  }
}
module.exports = Service
