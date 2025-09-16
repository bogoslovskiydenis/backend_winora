class CardBuilder {
  static adminListChanges(list) {
    return list.map(({ user_id, editor, changed_at, new_value, old_value }) => {
      return {
        user_id,
        editor,
        changed_at,
        new_value,
        old_value
      }
    })
  }
}
module.exports = CardBuilder
