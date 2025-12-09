const History = require("../models/historyModel");

const historyService = {

    // Ajouter une entrée dans l'historique
    async addHistoryEntry(roomId, videoId) {
        const video_url = `https://www.youtube.com/watch?v=${videoId}`;

        try {
            const result = await History.addEntry({
                room_id: roomId,
                video_url,
                title: null,
                thumbnail: null
            });

            return result.rows[0];
        } catch (err) {
            console.error("❌ ERREUR SQL (historyService) :", err);
            throw err;
        }
    },

    // Historique d'une seule room
    async getHistory(roomId) {
        const result = await History.getHistoryByRoom(roomId);
        return result.rows;
    },

    // Historique complet (toutes les rooms)
    async getAll() {
        const result = await History.getAll();
        return result.rows;
    },

    // Alias pour compatibilité contrôleur
    async getAllHistory() {
        return this.getAll();
    }
};

module.exports = historyService;
