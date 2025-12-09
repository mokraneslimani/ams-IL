// server/controllers/historyController.js
const historyService = require("../services/historyService");

// GET /api/history/:roomId
// → retourne l'historique d'une room
exports.getRoomHistory = async (req, res) => {
  const { roomId } = req.params;

  try {
    const rows = await historyService.getHistory(roomId);
    res.json(rows);
  } catch (err) {
    console.error("Erreur getRoomHistory :", err);
    res.status(500).json({ error: "Erreur serveur (GET history by room)" });
  }
};

// GET /api/history
// → retourne tout l'historique (utile pour debug/admin)
exports.getAllHistory = async (_req, res) => {
  try {
    const rows = await historyService.getAllHistory();
    res.json(rows);
  } catch (err) {
    console.error("Erreur getAllHistory :", err);
    res.status(500).json({ error: "Erreur serveur (GET all history)" });
  }
};

// POST /api/history
// body attendu : { roomId, videoUrl, title, thumbnail }
exports.addHistoryEntry = async (req, res) => {
  const { roomId, videoUrl, title, thumbnail } = req.body;

  // roomId + videoUrl obligatoires, title/thumbnail optionnels
  if (!roomId || !videoUrl) {
    return res
      .status(400)
      .json({ error: "roomId et videoUrl sont requis" });
  }

  try {
    const entry = await historyService.addHistoryEntry({
      roomId,
      videoUrl,
      title,
      thumbnail,
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error("Erreur addHistoryEntry :", err);
    res.status(500).json({ error: "Erreur serveur (POST history)" });
  }
};
