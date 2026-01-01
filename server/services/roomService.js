const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");
const notificationService = require("./notificationService");
const crypto = require("crypto");

const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const roomService = {
  // ===============================
  //   GET ALL ROOMS
  // ===============================
  async getAllRooms(userId) {
    const result = userId
      ? await Room.getRoomsForUser(userId)
      : await Room.getPublicRooms();
    return result.rows;
  },

  // ===============================
  //   GET ROOM BY ID (access control)
  // ===============================
  async getRoomByIdWithAccess(id, userId) {
    const result = await Room.getRoomById(id);
    const room = result.rows[0] || null;
    if (!room) return null;

    if (room.privacy === "private") {
      if (!userId) {
        throw createError("Acces reserve aux membres", 401);
      }

      if (room.owner_id !== Number(userId)) {
        const member = await RoomMember.isMember(id, userId);
        if (member.rows.length === 0) {
          throw createError("Acces refuse", 403);
        }
      }
    }

    return room;
  },

  // ===============================
  //   GET ROOM BY LINK
  // ===============================
  async getRoomByLink(link) {
    const result = await Room.getRoomByLink(link);
    return result.rows[0] || null;
  },

  // ===============================
  //   CREATE ROOM
  // ===============================
  async createRoom({ name, description, video_url, privacy, owner_id }) {
    const uniqueLink = crypto.randomBytes(10).toString("hex");
    const safePrivacy = privacy === "public" ? "public" : "private";

    const result = await Room.createRoom({
      name,
      description,
      video_url,
      privacy: safePrivacy,
      owner_id,
      link: uniqueLink,
    });

    const room = result.rows[0];

    // Add creator as member (owner)
    try {
      await RoomMember.addMember(room.id, owner_id, "owner");
    } catch (err) {
      console.error("Erreur addMember owner:", err);
    }

    return room;
  },

  // ===============================
  //   ADD MEMBER (owner only)
  // ===============================
  async addMember(roomId, requesterId, userId) {
    const roomResult = await Room.getRoomById(roomId);
    const room = roomResult.rows[0];
    if (!room) throw createError("Room introuvable", 404);

    if (room.owner_id !== Number(requesterId)) {
      throw createError("Acces refuse", 403);
    }

    const exists = await RoomMember.isMember(roomId, userId);
    if (exists.rows.length > 0) return exists.rows[0];

    const result = await RoomMember.addMember(roomId, userId);
    return result.rows[0];
  },

  // ===============================
  //   REMOVE MEMBER (owner or self)
  // ===============================
  async removeMember(roomId, requesterId, userId) {
    const roomResult = await Room.getRoomById(roomId);
    const room = roomResult.rows[0];
    if (!room) throw createError("Room introuvable", 404);

    const isOwner = room.owner_id === Number(requesterId);
    const isSelf = Number(requesterId) === Number(userId);
    if (!isOwner && !isSelf) {
      throw createError("Acces refuse", 403);
    }

    const result = await RoomMember.removeMember(roomId, userId);
    return result.rows[0] || null;
  },

  // ===============================
  //   GET MEMBERS (members only)
  // ===============================
  async getMembers(roomId, requesterId) {
    const roomResult = await Room.getRoomById(roomId);
    const room = roomResult.rows[0];
    if (!room) throw createError("Room introuvable", 404);

    if (room.owner_id !== Number(requesterId)) {
      const member = await RoomMember.isMember(roomId, requesterId);
      if (member.rows.length === 0) {
        throw createError("Acces refuse", 403);
      }
    }

    const result = await RoomMember.getMembers(roomId);
    return result.rows;
  },

  // ===============================
  //   SAFE ADD MEMBER (no duplicate)
  // ===============================
  async safeAddMember(roomId, userId) {
    const roomResult = await Room.getRoomById(roomId);
    const room = roomResult.rows[0];
    if (!room) throw createError("Room introuvable", 404);

    const exists = await RoomMember.isMember(roomId, userId);
    if (exists.rows.length > 0) return exists.rows[0];
    const added = await RoomMember.addMember(roomId, userId);
    return added.rows[0];
  },

  // ===============================
  //   JOIN ROOM BY LINK
  // ===============================
  async joinRoomByLink(link, userId) {
    const room = await this.getRoomByLink(link);
    if (!room) throw createError("Room introuvable", 404);

    const exists = await RoomMember.isMember(room.id, userId);
    if (exists.rows.length > 0) {
      return { room, member: exists.rows[0] };
    }

    const added = await RoomMember.addMember(room.id, userId);
    return { room, member: added.rows[0] };
  },

  // INVITER DES AMIS : cree des notifications
  async inviteFriends({ roomId, inviterId, friendIds }) {
    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      throw createError("friendIds requis", 400);
    }

    const roomResult = await Room.getRoomById(roomId);
    const room = roomResult.rows[0];
    if (!room) throw createError("Room introuvable", 404);

    if (room.owner_id !== Number(inviterId)) {
      const member = await RoomMember.isMember(roomId, inviterId);
      if (member.rows.length === 0) {
        throw createError("Acces refuse", 403);
      }
    }

    const invitations = [];
    for (const fid of friendIds) {
      const notif = await notificationService.create(
        fid,
        JSON.stringify({
          type: "room_invite",
          roomId,
          inviterId,
        })
      );
      invitations.push(notif);
    }
    return invitations;
  }
};

module.exports = roomService;
