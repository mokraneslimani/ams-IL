const roomService = require("../services/roomService");

// ===============================
//   GET ALL ROOMS
// ===============================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   GET ROOM BY ID
// ===============================
exports.getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room introuvable" });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   CREATE ROOM
// ===============================
exports.createRoom = async (req, res) => {
  try {
    const newRoom = await roomService.createRoom(req.body);
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   ADD MEMBER
// ===============================
exports.addMember = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;

    const result = await roomService.addMember(roomId, userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   REMOVE MEMBER
// ===============================
exports.removeMember = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.params.userId;

    const result = await roomService.removeMember(roomId, userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
