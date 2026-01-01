const Message = require("../models/messageModel");

const messageService = {
  async listByRoom(roomId, limit) {
    const result = await Message.getMessagesByRoom(roomId, limit);
    return result.rows;
  },

  async create(roomId, userId, content) {
    const trimmed = String(content || "").trim();
    if (!trimmed) {
      throw new Error("Message vide");
    }

    const result = await Message.createMessage(roomId, userId, trimmed);
    return result.rows[0];
  }
};

module.exports = messageService;
