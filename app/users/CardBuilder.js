class CardBuilder {
  static user(user) {
    return {
      id: user.id,
      session: user.remember_token,
      role: user.role,
      balances: user.balances,
      email: user.email
    }
  }
  static indexAdmin(posts) {
    return posts.map(({ id, email, login, created_at, role }) => ({
      id,
      email,
      login,
      created_at,
      role
    }))
  }
  static singleAdmin({ id, email, login, created_at, role }) {
    return { id, email, login, created_at, role }
  }
}
module.exports = CardBuilder
