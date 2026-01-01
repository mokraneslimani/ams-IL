const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

// GET all rooms
router.get("/", optionalAuth, roomController.getAllRooms);

// GET room by share link
router.get("/link/:link", roomController.getRoomByLink);

// GET one room by ID
router.get("/:id", optionalAuth, roomController.getRoomById);
router.get("/:id/members", auth, roomController.getMembers);

// CREATE room
router.post("/", auth, roomController.createRoom);

// ADD MEMBER to room
router.post("/:id/members", auth, roomController.addMember);

// REMOVE MEMBER from room
router.delete("/:id/members/:userId", auth, roomController.removeMember);

// JOIN room via link
router.post("/link/:link/join", auth, roomController.joinRoomByLink);

// Invite friends to a room (notifications)
router.post("/:id/invite", auth, roomController.inviteFriends);

module.exports = router;
