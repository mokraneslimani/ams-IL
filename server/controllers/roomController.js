const roomService = require("../services/roomService");

const handleError = (res, err, fallbackStatus = 500) => {
  const status = err.status || fallbackStatus;
  return res.status(status).json({ message: err.message });
};

// ===============================
//   GET ALL ROOMS
// ===============================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms(req.userId);
    res.json(rooms);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   GET ROOM BY ID
// ===============================
exports.getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomByIdWithAccess(req.params.id, req.userId);
    if (!room) {
      return res.status(404).json({ message: "Room introuvable" });
    }
    res.json(room);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   GET ROOM BY LINK
// ===============================
exports.getRoomByLink = async (req, res) => {
  try {
    const room = await roomService.getRoomByLink(req.params.link);
    if (!room) {
      return res.status(404).json({ message: "Room introuvable" });
    }
    res.json(room);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   CREATE ROOM
// ===============================
exports.createRoom = async (req, res) => {
  try {
    const newRoom = await roomService.createRoom({
      ...req.body,
      owner_id: req.userId,
    });
    res.status(201).json(newRoom);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   ADD MEMBER (owner only)
// ===============================
exports.addMember = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId requis" });
    }

    const result = await roomService.addMember(roomId, req.userId, userId);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   REMOVE MEMBER (owner or self)
// ===============================
exports.removeMember = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.params.userId;

    const result = await roomService.removeMember(roomId, req.userId, userId);
    if (!result) {
      return res.status(404).json({ message: "Membre introuvable" });
    }
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   GET MEMBERS
// ===============================
exports.getMembers = async (req, res) => {
  try {
    const roomId = req.params.id;
    const members = await roomService.getMembers(roomId, req.userId);
    res.json(members);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   JOIN ROOM BY LINK
// ===============================
exports.joinRoomByLink = async (req, res) => {
  try {
    const result = await roomService.joinRoomByLink(req.params.link, req.userId);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

// ===============================
//   INVITE FRIENDS (notifications)
// ===============================
exports.inviteFriends = async (req, res) => {
  const roomId = req.params.id;
  const { friendIds } = req.body;

  if (!Array.isArray(friendIds) || friendIds.length === 0) {
    return res.status(400).json({ message: "friendIds requis" });
  }

  try {
    const result = await roomService.inviteFriends({
      roomId,
      inviterId: req.userId,
      friendIds,
    });
    res.json({ success: true, invitations: result });
  } catch (err) {
    handleError(res, err, 400);
  }
};
