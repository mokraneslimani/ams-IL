const db = require("../db");

const Friend = {
  async getFriends(userId) {
    const query = `
      SELECT u.id, u.username, u.email, f.status
      FROM friends f
      JOIN users u
        ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
      WHERE f.status = 'accepted'
        AND (f.user_id = $1 OR f.friend_id = $1)
    `;
    return db.query(query, [userId]);
  },

  async getPendingReceived(userId) {
    const query = `
      SELECT u.id, u.username, u.email, f.status, f.id AS relation_id
      FROM friends f
      JOIN users u ON u.id = f.user_id
      WHERE f.status = 'pending'
        AND f.friend_id = $1
    `;
    return db.query(query, [userId]);
  },

  async getPendingSent(userId) {
    const query = `
      SELECT u.id, u.username, u.email, f.status, f.id AS relation_id
      FROM friends f
      JOIN users u ON u.id = f.friend_id
      WHERE f.status = 'pending'
        AND f.user_id = $1
    `;
    return db.query(query, [userId]);
  },

  async createRequest(userId, targetId) {
    const query = `
      INSERT INTO friends (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
    `;
    return db.query(query, [userId, targetId]);
  },

  async acceptRequest(requesterId, currentUserId) {
    const query = `
      UPDATE friends
      SET status = 'accepted'
      WHERE user_id = $1
        AND friend_id = $2
        AND status = 'pending'
      RETURNING *
    `;
    return db.query(query, [requesterId, currentUserId]);
  },

  async deleteRelation(userA, userB) {
    const query = `
      DELETE FROM friends
      WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)
      RETURNING *
    `;
    return db.query(query, [userA, userB]);
  },

  async relationExists(userA, userB) {
    const query = `
      SELECT *
      FROM friends
      WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)
      LIMIT 1
    `;
    return db.query(query, [userA, userB]);
  },

  async getSuggestions(userId, limit = 5) {
    const query = `
      SELECT u.id, u.username, u.email
      FROM users u
      WHERE u.id <> $1
        AND u.id NOT IN (
          SELECT CASE WHEN user_id = $1 THEN friend_id ELSE user_id END
          FROM friends
          WHERE user_id = $1 OR friend_id = $1
        )
      ORDER BY u.created_at DESC
      LIMIT $2
    `;
    return db.query(query, [userId, limit]);
  },
};

module.exports = Friend;
