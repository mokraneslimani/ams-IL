const db = require("../db");

const Annotation = {
  getById(id) {
    return db.query(
      `SELECT a.*, u.username, u.avatar
       FROM annotations a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [id]
    );
  },

  listByRoomAndVideo(roomId, videoUrl, limit = 500) {
    return db.query(
      `SELECT a.*, u.username, u.avatar
       FROM annotations a
       JOIN users u ON u.id = a.user_id
       WHERE a.room_id = $1 AND a.video_url = $2
       ORDER BY a.timecode_sec ASC, a.created_at ASC
       LIMIT $3`,
      [roomId, videoUrl, limit]
    );
  },

  create({ roomId, userId, videoUrl, timecodeSec, content }) {
    return db.query(
      `INSERT INTO annotations (room_id, user_id, video_url, timecode_sec, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [roomId, userId, videoUrl, timecodeSec, content]
    );
  },

  deleteById(id) {
    return db.query("DELETE FROM annotations WHERE id = $1 RETURNING *", [id]);
  }
};

module.exports = Annotation;
