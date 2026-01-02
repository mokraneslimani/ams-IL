const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/:roomId", playlistController.getPlaylistByRoom);
router.post("/:roomId", playlistController.addPlaylistItem);
router.delete("/:roomId/:itemId", playlistController.deletePlaylistItem);

module.exports = router;
