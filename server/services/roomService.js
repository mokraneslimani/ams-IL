const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel"); // si tu as un model pour room_members
const notificationService = require("./notificationService");
const crypto = require("crypto");

const roomService = {
  // ===============================
  //   GET ALL ROOMS
  // ===============================
  async getAllRooms() {
    const result = await Room.getAllRooms();
    return result.rows;
  },

  // ===============================
  //   GET ROOM BY ID
  // ===============================
  async getRoomById(id) {
    const result = await Room.getRoomById(id);
    return result.rows[0] || null;
  },

  // ===============================
  //   CREATE ROOM
  // ===============================
  async createRoom({ name, description, video_url, privacy, owner_id }) {
    const uniqueLink = crypto.randomBytes(10).toString("hex");

    const result = await Room.createRoom({
      name,
      description,
      video_url,
      privacy,
      owner_id,
      link: uniqueLink
    });

    const room = result.rows[0];

    // Ajouter automatiquement le créateur comme membre (owner)
    try {
      await RoomMember.addMember(room.id, owner_id, "owner");
    } catch (err) {
      console.error("Erreur addMember owner:", err);
    }

    return room;
  },

  // ===============================
  //   ADD MEMBER
  // ===============================
  async addMember(roomId, userId) {
    const result = await RoomMember.addMember(roomId, userId);
    return result.rows[0];
  },

  // ===============================
  //   REMOVE MEMBER
  // ===============================
  async removeMember(roomId, userId) {
    const result = await RoomMember.removeMember(roomId, userId);
    return result.rows[0];
  },

  // ===============================
  //   GET MEMBERS
  // ===============================
  async getMembers(roomId) {
    const result = await RoomMember.getMembers(roomId);
    return result.rows;
  },

  // ===============================
  //   SAFE ADD MEMBER (no duplicate)
  // ===============================
  async safeAddMember(roomId, userId) {
    const exists = await RoomMember.isMember(roomId, userId);
    if (exists.rows.length > 0) return exists.rows[0];
    const added = await RoomMember.addMember(roomId, userId);
    return added.rows[0];
  },

  // INVITER DES AMIS : crée des notifications
  async inviteFriends({ roomId, inviterId, friendIds }) {
    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      throw new Error("friendIds requis");
    }

    // On pourrait valider que la room existe et que inviterId est membre/owner
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
