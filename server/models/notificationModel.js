const db = require("../db");

const Notification = {
  async addNotification(userId, message) {
    const query = `
      INSERT INTO notifications (user_id, message)
      VALUES ($1, $2)
      RETURNING *
    `;
    return db.query(query, [userId, message]);
  },

  async getById(id) {
    const query = `
      SELECT * FROM notifications
      WHERE id = $1
    `;
    return db.query(query, [id]);
  },

  async getByUser(userId, includeArchived = false) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
        AND ($2::boolean = TRUE OR is_archived = FALSE)
      ORDER BY created_at DESC
    `;
    return db.query(query, [userId, includeArchived]);
  },

  async markRead(id, userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    return db.query(query, [id, userId]);
  },

  async markAllRead(userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
    `;
    return db.query(query, [userId]);
  },

  async archive(id, userId) {
    const query = `
      UPDATE notifications
      SET is_archived = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    return db.query(query, [id, userId]);
  },

  async delete(id, userId) {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    return db.query(query, [id, userId]);
  },
};

module.exports = Notification;
