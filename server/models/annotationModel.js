const db = require("../db");

const BASE_SELECT = `
  SELECT a.*, u.username, u.avatar
  FROM annotations a
  JOIN users u ON u.id = a.user_id
`;

const Annotation = {
  getById(id) {
    return db.query(
      `${BASE_SELECT}
       WHERE a.id = $1`,
      [id]
    );
  },

  listByRoomAndVideo(roomId, videoUrl, limit = 500) {
    return this.listByRoomAndVideoFiltered({
      roomId,
      videoUrl,
      limit
    });
  },

  listByRoomAndVideoFiltered({
    roomId,
    videoUrl,
    limit = 500,
    offset = 0,
    authorId = null,
    fromSec = null,
    toSec = null,
    cursor = null
  }) {
    const clauses = ["a.room_id = $1", "a.video_url = $2"];
    const values = [roomId, videoUrl];

    if (authorId !== null) {
      values.push(authorId);
      clauses.push(`a.user_id = $${values.length}`);
    }
    if (fromSec !== null) {
      values.push(fromSec);
      clauses.push(`a.timecode_sec >= $${values.length}`);
    }
    if (toSec !== null) {
      values.push(toSec);
      clauses.push(`a.timecode_sec <= $${values.length}`);
    }
    if (cursor !== null) {
      values.push(cursor);
      clauses.push(`a.id > $${values.length}`);
    }

    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

    return db.query(
      `${BASE_SELECT}
       WHERE ${clauses.join(" AND ")}
       ORDER BY a.timecode_sec ASC, a.created_at ASC, a.id ASC
       LIMIT $${limitParam}
       OFFSET $${offsetParam}`,
      values
    );
  },

  findRecentDuplicate({ roomId, userId, videoUrl, timecodeSec, content }) {
    return db.query(
      `${BASE_SELECT}
       WHERE a.room_id = $1
         AND a.user_id = $2
         AND a.video_url = $3
         AND a.timecode_sec = $4
         AND a.content = $5
         AND a.created_at >= NOW() - INTERVAL '30 seconds'
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [roomId, userId, videoUrl, timecodeSec, content]
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
  },

  deleteByIdInRoom(id, roomId) {
    return db.query(
      "DELETE FROM annotations WHERE id = $1 AND room_id = $2 RETURNING *",
      [id, roomId]
    );
  },

  updateByIdInRoom({ id, roomId, content, timecodeSec }) {
    return db.query(
      `UPDATE annotations
       SET content = $1,
           timecode_sec = $2,
           updated_at = NOW()
       WHERE id = $3 AND room_id = $4
       RETURNING *`,
      [content, timecodeSec, id, roomId]
    );
  }
};

module.exports = Annotation;
