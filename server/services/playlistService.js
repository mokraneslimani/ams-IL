const Playlist = require("../models/playlistModel");

const playlistService = {
  async listByRoom(roomId) {
    const result = await Playlist.getByRoom(roomId);
    return result.rows;
  },

  async addItem(roomId, userId, { title, video_url, thumbnail }) {
    const url = String(video_url || "").trim();
    if (!url) {
      throw new Error("video_url requis");
    }

    const result = await Playlist.addItem({
      room_id: roomId,
      user_id: userId,
      title: title || null,
      video_url: url,
      thumbnail: thumbnail || null,
    });
    return result.rows[0];
  },

  async removeItem(roomId, itemId) {
    const result = await Playlist.deleteItem(itemId, roomId);
    return result.rows[0] || null;
  }
};

module.exports = playlistService;
