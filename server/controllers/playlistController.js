const playlistService = require("../services/playlistService");
const roomService = require("../services/roomService");

const handleError = (res, err, fallbackStatus = 500) => {
  const status = err.status || fallbackStatus;
  return res.status(status).json({ message: err.message });
};

// GET /api/playlists/:roomId
exports.getPlaylistByRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    await roomService.getRoomByIdWithAccess(roomId, req.userId);
    const items = await playlistService.listByRoom(roomId);
    res.json(items);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/playlists/:roomId
exports.addPlaylistItem = async (req, res) => {
  const { roomId } = req.params;
  try {
    await roomService.getRoomByIdWithAccess(roomId, req.userId);
    const item = await playlistService.addItem(roomId, req.userId, req.body);
    res.status(201).json(item);
  } catch (err) {
    handleError(res, err, 400);
  }
};

// DELETE /api/playlists/:roomId/:itemId
exports.deletePlaylistItem = async (req, res) => {
  const { roomId, itemId } = req.params;
  try {
    await roomService.getRoomByIdWithAccess(roomId, req.userId);
    const removed = await playlistService.removeItem(roomId, itemId);
    if (!removed) {
      return res.status(404).json({ message: "Element introuvable" });
    }
    res.json(removed);
  } catch (err) {
    handleError(res, err, 400);
  }
};
