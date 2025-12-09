const db = require("../db");

const History = {

    // Ajouter une entrée dans la table history
    addEntry: ({ room_id, video_url, title = null, thumbnail = null }) => {
        const query = `
            INSERT INTO history (room_id, video_url, title, thumbnail)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        return db.query(query, [room_id, video_url, title, thumbnail]);
    },

    // Récupérer l'historique d'une room
    getHistoryByRoom: (room_id) => {
        const query = `
            SELECT * FROM history
            WHERE room_id = $1
            ORDER BY created_at DESC;
        `;
        return db.query(query, [room_id]);
    },

    // Récupérer tout l'historique (toutes les rooms)
    getAll: () => {
        return db.query(`
            SELECT * FROM history
            ORDER BY created_at DESC;
        `);
    }
};

module.exports = History;
