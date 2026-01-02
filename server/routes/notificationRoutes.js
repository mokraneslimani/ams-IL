const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", notificationController.getNotifications);
router.post("/read/:id", notificationController.markRead);
router.post("/read-all", notificationController.markAllRead);
router.post("/archive/:id", notificationController.archiveNotification);
router.delete("/:id", notificationController.deleteNotification);

// Room invitations actions
router.post("/room-invite/accept", notificationController.acceptRoomInvite);
router.post("/room-invite/reject", notificationController.rejectRoomInvite);

module.exports = router;
