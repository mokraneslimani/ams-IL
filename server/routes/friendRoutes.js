const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", friendController.getFriends);
router.post("/request", friendController.sendRequest);
router.post("/accept/:requesterId", friendController.acceptRequest);
router.delete("/:friendId", friendController.deleteFriend);

module.exports = router;
