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

  async getByUser(userId) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    return db.query(query, [userId]);
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
};

module.exports = Notification;
