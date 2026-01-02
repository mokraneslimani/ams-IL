const Notification = require("../models/notificationModel");

const notificationService = {
  async create(userId, message) {
    return (await Notification.addNotification(userId, message)).rows[0];
  },

  async get(id) {
    const rows = await Notification.getById(id);
    return rows.rows[0] || null;
  },

  async list(userId, includeArchived = false) {
    return (await Notification.getByUser(userId, includeArchived)).rows;
  },

  async markRead(id, userId) {
    return (await Notification.markRead(id, userId)).rows[0];
  },

  async markAllRead(userId) {
    await Notification.markAllRead(userId);
    return true;
  },

  async archive(id, userId) {
    return (await Notification.archive(id, userId)).rows[0];
  },

  async remove(id, userId) {
    return (await Notification.delete(id, userId)).rows[0];
  },
};

module.exports = notificationService;
