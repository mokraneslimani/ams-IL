const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const rows = await notificationService.list(req.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await notificationService.markRead(id, req.userId);
    res.json(notif);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
