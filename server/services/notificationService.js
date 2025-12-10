const Notification = require("../models/notificationModel");

const notificationService = {
  async create(userId, message) {
    return (await Notification.addNotification(userId, message)).rows[0];
  },

  async get(id) {
    const rows = await Notification.getById(id);
    return rows.rows[0] || null;
  },

  async list(userId) {
    return (await Notification.getByUser(userId)).rows;
  },

  async markRead(id, userId) {
    return (await Notification.markRead(id, userId)).rows[0];
  },

  async markAllRead(userId) {
    await Notification.markAllRead(userId);
    return true;
  },
};

module.exports = notificationService;
