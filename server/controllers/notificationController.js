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

// ===============================
//   Room invitation : accept / reject
// ===============================
exports.acceptRoomInvite = async (req, res) => {
  const { notificationId } = req.body;
  const userId = req.userId;
  try {
    const notif = await notificationService.get(notificationId);
    if (!notif || notif.user_id !== userId) {
      return res.status(404).json({ message: "Invitation introuvable" });
    }

    // message stocké comme JSON string
    let payload;
    try {
      payload = JSON.parse(notif.message);
    } catch {
      return res.status(400).json({ message: "Format d'invitation invalide" });
    }

    if (payload.type !== "room_invite" || !payload.roomId) {
      return res.status(400).json({ message: "Ce n'est pas une invitation de room" });
    }

    await notificationService.markRead(notificationId, userId);

    // ajouter le membre dans la room
    const roomMember = await require("../services/roomService").safeAddMember(payload.roomId, userId);

    // notifier l'invitant
    if (payload.inviterId) {
      await notificationService.create(
        payload.inviterId,
        JSON.stringify({
          type: "room_invite_response",
          roomId: payload.roomId,
          status: "accepted",
          from: userId,
        })
      );
    }

    res.json({ roomId: payload.roomId, member: roomMember });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.rejectRoomInvite = async (req, res) => {
  const { notificationId } = req.body;
  const userId = req.userId;
  try {
    const notif = await notificationService.get(notificationId);
    if (!notif || notif.user_id !== userId) {
      return res.status(404).json({ message: "Invitation introuvable" });
    }

    let payload;
    try {
      payload = JSON.parse(notif.message);
    } catch {
      return res.status(400).json({ message: "Format d'invitation invalide" });
    }

    if (payload.type !== "room_invite" || !payload.roomId) {
      return res.status(400).json({ message: "Ce n'est pas une invitation de room" });
    }

    await notificationService.markRead(notificationId, userId);

    if (payload.inviterId) {
      await notificationService.create(
        payload.inviterId,
        JSON.stringify({
          type: "room_invite_response",
          roomId: payload.roomId,
          status: "rejected",
          from: userId,
        })
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
