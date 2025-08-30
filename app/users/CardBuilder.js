class CardBuilder {
  static user(user) {
    return {
      id: user.id,
      session: user.remember_token,
      role: user.role
    }
  }
}
module.exports = CardBuilder
