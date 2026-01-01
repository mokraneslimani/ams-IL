const messageService = require("../services/messageService");
const roomService = require("../services/roomService");

const handleError = (res, err, fallbackStatus = 500) => {
  const status = err.status || fallbackStatus;
  return res.status(status).json({ message: err.message });
};

// ===============================
//   GET MESSAGES BY ROOM
// ===============================
exports.getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;
  const limit = Number(req.query.limit || 100);
  try {
    await roomService.getRoomByIdWithAccess(roomId, req.userId);
    const messages = await messageService.listByRoom(roomId, limit);
    res.json(messages);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   CREATE MESSAGE
// ===============================
exports.createMessage = async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  try {
    await roomService.getRoomByIdWithAccess(roomId, req.userId);
    const message = await messageService.create(roomId, req.userId, content);
    res.status(201).json(message);
  } catch (err) {
    handleError(res, err, 400);
  }
};
