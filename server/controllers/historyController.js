const historyService = require("../services/historyService");

// GET /api/history/:roomId
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
exports.getAllHistory = async (req, res) => {
    try {
        const rows = await historyService.getAll();
        res.json(rows);
    } catch (err) {
        console.error("Erreur getAllHistory :", err);
        res.status(500).json({ error: "Erreur serveur (GET all history)" });
    }
};

// POST /api/history
exports.addHistoryEntry = async (req, res) => {
    const { roomId, videoId } = req.body;

    if (!roomId || !videoId) {
        return res.status(400).json({ error: "roomId et videoId requis" });
    }

    try {
        const entry = await historyService.addHistoryEntry(roomId, videoId);
        res.status(201).json(entry);
    } catch (err) {
        console.error("Erreur addHistoryEntry :", err);
        res.status(500).json({ error: "Erreur serveur (POST history)" });
    }
};
