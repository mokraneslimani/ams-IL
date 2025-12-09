const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

// Récupérer l'historique d'une room
router.get("/:roomId", historyController.getRoomHistory);

// Récupérer tout l'historique
router.get("/", historyController.getAllHistory);

// Ajouter une entrée dans l'historique
router.post("/", historyController.addHistoryEntry);

module.exports = router;
