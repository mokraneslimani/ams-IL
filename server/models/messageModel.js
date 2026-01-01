const db = require("../db");

// =====================================
//   MESSAGE MODEL
// =====================================
const Message = {
  // Get messages for a room
  getMessagesByRoom(roomId, limit = 100) {
    const query = `
      SELECT m.id, m.room_id, m.user_id, m.content, m.created_at,
             u.username, u.email, u.avatar
      FROM messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.room_id = $1
      ORDER BY m.created_at ASC
      LIMIT $2`;

    return db.query(query, [roomId, limit]);
  },

  // Create a message
  createMessage(roomId, userId, content) {
    const query = `
      INSERT INTO messages (room_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *`;

    return db.query(query, [roomId, userId, content]);
  }
};

module.exports = Message;
