const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// GET all rooms
router.get("/", roomController.getAllRooms);

// GET one room by ID
router.get("/:id", roomController.getRoomById);

// CREATE room
router.post("/", roomController.createRoom);

// ADD MEMBER to room
router.post("/:id/members", roomController.addMember);

// REMOVE MEMBER from room
router.delete("/:id/members/:userId", roomController.removeMember);

module.exports = router;
