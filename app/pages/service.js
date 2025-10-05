const PageModel = require("@/models/PageKnex")
const mainSchema = require("@/schemas/page")
class Service {
  constructor() {
    this.schema = mainSchema
  }
  async mainPage(url) {
    return await this.getPublicPostByUrl(url)
  }
  async getPublicPostByUrl(url) {
    const pageModel = new PageModel(this.schema)
    return await pageModel.getPublicPostByUrl(url)
  }
  async indexAdmin(settings) {
    const response = {
      status: "ok",
      body: [],
      total: 0,
      lang: _LANG[settings.lang]
    }
    const pageModel = new PageModel(this.schema)
    response.body = await pageModel.getPosts(settings)
    response.total = await pageModel.getTotalCountByLang(settings.lang)
    return response
  }
  async getPostById(id) {
    const model = new PageModel(this.schema)
    return await model.getPostById(id)
  }
  async update(data) {
    const response = {
      status: "ok",
      body: {}
    }
    const pageModel = new PageModel(this.schema)
    const dataSave = this.dataValidate(data)
    await pageModel.updateById(data.id, dataSave)
    return response
  }
  async shop() {
    return {
      shares: [
        {
          id: 1,
          title: "Время выбрать",
          mainTitle: "Инвестиции",
          image: "",
          depositAmount: 90,
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 2,
          title: "Время выбрать 2",
          mainTitle: "Инвестиции 2",
          image: "",
          buttonText: "Купить 2",
          depositAmount: 70,
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 3,
          title: "Время выбрать 3",
          mainTitle: "Инвестиции 3",
          image: "",
          buttonText: "Купить 3",
          depositAmount: 65,
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        }
      ],
      boxes: [
        {
          id: 1,
          title: "Золотой сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 2,
          title: "Золотой сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 3,
          title: "Огненный сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 4,
          title: "Огненный сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 5,
          title: "Неоновый сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 6,
          title: "Неоновый сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 7,
          title: "Солнечный сундук",
          subTitle: "дает шанс <b>получить USDT</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/box.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        }
      ],
      bonuses: [
        {
          id: 1,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5% скидкой</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 2,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 3,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 4,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 5,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 6,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        },
        {
          id: 7,
          title: "Замороженная инвестиция",
          subTitle: "Дает бонус с <b>5 USDT / день</b>",
          depositAmount: 150,
          image: "https://api.dev-site.site/uploads/Union.png",
          created_at: "2025-01-23 09:46:58",
          updated_at: "2025-01-23 09:46:58"
        }
      ]
    }
  }
  dataValidate(data) {
    const newData = {}
    newData.title = data.title || ""
    newData.status = data.status || "hide"
    if (data.created_at) newData.created_at = data.created_at
    if (data.updated_at) newData.updated_at = data.updated_at
    newData.content = data.content || ""
    newData.description = data.description || ""
    newData.h1 = data.h1 || ""
    newData.keywords = data.keywords || ""
    newData.meta_title = data.meta_title || ""
    newData.short_desc = data.short_desc || ""
    newData.thumbnail = data.thumbnail || _THUMBNAIL
    if (data.post_type) newData.post_type = data.post_type
    if (data.slug) newData.slug = data.slug
    return newData
  }
}
module.exports = new Service()
