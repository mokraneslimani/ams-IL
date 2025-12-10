const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const auth = require("../middleware/authMiddleware");

// GET all rooms
router.get("/", roomController.getAllRooms);

// GET one room by ID
router.get("/:id", roomController.getRoomById);
router.get("/:id/members", roomController.getMembers);

// CREATE room
router.post("/", roomController.createRoom);

// ADD MEMBER to room
router.post("/:id/members", roomController.addMember);

// REMOVE MEMBER from room
router.delete("/:id/members/:userId", roomController.removeMember);

// Invite friends to a room (notifications)
router.post("/:id/invite", auth, roomController.inviteFriends);

module.exports = router;
