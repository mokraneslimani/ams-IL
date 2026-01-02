const db = require("../db");

const Playlist = {
  async getByRoom(roomId) {
    const query = `
      SELECT p.id, p.room_id, p.user_id, p.title, p.video_url, p.thumbnail, p.created_at,
             u.username, u.email
      FROM playlist_items p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.room_id = $1
      ORDER BY p.created_at ASC
    `;
    return db.query(query, [roomId]);
  },

  async addItem({ room_id, user_id, title, video_url, thumbnail }) {
    const query = `
      INSERT INTO playlist_items (room_id, user_id, title, video_url, thumbnail)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return db.query(query, [room_id, user_id, title, video_url, thumbnail]);
  },

  async deleteItem(id, roomId) {
    const query = `
      DELETE FROM playlist_items
      WHERE id = $1 AND room_id = $2
      RETURNING *
    `;
    return db.query(query, [id, roomId]);
  }
};

module.exports = Playlist;
