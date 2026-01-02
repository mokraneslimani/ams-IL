const History = require("../models/historyModel");

const historyService = {
    // Ajouter une entree dans l'historique
    async addHistoryEntry(payload, videoIdLegacy) {
        let roomId;
        let videoUrl;
        let title = null;
        let thumbnail = null;

        if (typeof payload === "object" && payload !== null) {
            roomId = payload.roomId || payload.room_id;
            videoUrl = payload.videoUrl || payload.video_url;
            title = payload.title || null;
            thumbnail = payload.thumbnail || null;
        } else {
            roomId = payload;
        }

        if (!videoUrl && videoIdLegacy) {
            videoUrl = `https://www.youtube.com/watch?v=${videoIdLegacy}`;
        }

        try {
            const result = await History.addEntry({
                room_id: roomId,
                video_url: videoUrl,
                title,
                thumbnail
            });

            return result.rows[0];
        } catch (err) {
            console.error("Erreur SQL (historyService) :", err);
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
