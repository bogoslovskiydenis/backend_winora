module.exports = class BaseHandler {
  setNext(handler) {
    this.nextHandler = handler
    return handler
  }

  async handle(context) {
    if (context.errors && context.errors.length > 0) {
      return context
    }
    if (this.nextHandler) {
      return this.nextHandler.handle(context)
    }
    return context
  }
}
