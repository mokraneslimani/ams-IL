const express = require("express");
const router = express.Router();
const cguController = require("../controllers/cguController");

router.get("/", cguController.getCgu);

module.exports = router;
