const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// GET messages for a room
router.get("/:roomId", messageController.getMessagesByRoom);

// CREATE message
router.post("/:roomId", messageController.createMessage);

module.exports = router;
