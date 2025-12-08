const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel"); // si tu as un model pour room_members
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

    return result.rows[0];
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
  }
};

module.exports = roomService;
