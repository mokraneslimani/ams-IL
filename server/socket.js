// ==============================================
// 🔌 SOCKET.IO — Gestion des Rooms en temps réel
// ==============================================
//
// Ce module gère :
// - les connexions WebSocket
// - les rooms (join/leave)
// - la liste des participants
// - la synchronisation vidéo (play / pause / seek)
// - un "host" par room (contrôle la vidéo)
// - le chat en temps réel
// - l’historique des vidéos regardées
//
// ==============================================
const historyService = require("./services/historyService");

module.exports = function (io) {

    // Mémoire temporaire côté serveur
    const roomsData = {};

    // ==============================================
    // 🔌 Connexion d’un nouveau client
    // ==============================================
    io.on("connection", (socket) => {
        console.log("🟢 Client connecté :", socket.id);

        // ------------------------------------------
        // 🟦 Rejoindre une room
        // ------------------------------------------
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`📌 ${socket.id} a rejoint la room ${roomId}`);

            if (!roomsData[roomId]) {
                roomsData[roomId] = {
                    host: socket.id,
                    users: []
                };
                console.log(`👑 ${socket.id} est le host de la room ${roomId}`);
            }

            roomsData[roomId].users.push(socket.id);

            io.to(roomId).emit("participants_update", roomsData[roomId].users);
            io.to(roomId).emit("host_update", roomsData[roomId].host);
        });

        // ------------------------------------------
        // 🎬 Synchronisation vidéo : PLAY
        // ------------------------------------------
        socket.on("video_play", (data) => {
            console.log(`▶️ Lecture room ${data.roomId}, time = ${data.currentTime}`);
            socket.to(data.roomId).emit("video_play", data);
        });

        // ------------------------------------------
        // ⏸ Synchronisation vidéo : PAUSE
        // ------------------------------------------
        socket.on("video_pause", (data) => {
            console.log(`⏸ Pause room ${data.roomId}`);
            socket.to(data.roomId).emit("video_pause", data);
        });

        // ------------------------------------------
        // ⏩ Synchronisation vidéo : SEEK
        // ------------------------------------------
        socket.on("video_seek", (data) => {
            console.log(`⏩ Seek room ${data.roomId}, time = ${data.currentTime}`);
            socket.to(data.roomId).emit("video_seek", data);
        });

        // ------------------------------------------
        // 🔵 SYNCHRO : CHANGER DE VIDÉO (HISTORIQUE INCLUS)
        // ------------------------------------------
        // ------------------------------------------
// 🔵 SYNCHRO : CHANGER DE VIDÉO + DEBUG
// ------------------------------------------
socket.on("change_video", async (data) => {
    console.log("DEBUG SOCKET: change_video reçu :", data);

    // Diffuser dans la room
    socket.to(data.roomId).emit("change_video", data);

    // 🔥 Debug avant enregistrement
    console.log("DEBUG SOCKET: Appel historyService.addHistoryEntry...");

    try {
        const result = await historyService.addHistoryEntry(data.roomId, data.videoId);

        console.log("DEBUG SOCKET: Résultat historyService :", result);

        console.log("📚 Historique mis à jour !");
    } catch (err) {
        console.log("❌ DEBUG ERREUR SOCKET :", err);
    }
});

        // ------------------------------------------
        // 🔁 Synchronisation (nouvel arrivant)
        // ------------------------------------------
        socket.on("video_sync_request", (roomId) => {
            socket.to(roomId).emit("video_sync_request");
        });

        socket.on("video_sync_response", (data) => {
            socket.to(data.roomId).emit("video_sync_response", data);
        });

        // ------------------------------------------
        // 💬 Chat en temps réel
        // ------------------------------------------
        socket.on("chat_message", (data) => {
            console.log(`💬 Message room ${data.roomId} : ${data.username} → ${data.message}`);
            io.to(data.roomId).emit("chat_message", data);
        });

        // ------------------------------------------
        // ❌ Déconnexion
        // ------------------------------------------
        socket.on("disconnect", () => {
            console.log("🔴 Déconnecté :", socket.id);

            for (const roomId in roomsData) {
                const room = roomsData[roomId];
                if (!room) continue;

                room.users = room.users.filter(u => u !== socket.id);

                if (room.host === socket.id) {
                    room.host = room.users[0] || null;
                    io.to(roomId).emit("host_update", room.host);
                }

                io.to(roomId).emit("participants_update", room.users);
            }
        });
    });
};
