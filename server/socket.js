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
//
// Il est utilisé dans server.js :
// const socketHandler = require("./socket");
// socketHandler(io);
// ==============================================

module.exports = function (io) {

    // Mémoire temporaire côté serveur (pas en base)
    // Format :
    // roomsData = {
    //   "roomId": {
    //       host: "socketId",
    //       users: ["socketId1", "socketId2"]
    //   }
    // }
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

            // Si la room n'existe pas encore → on la crée
            if (!roomsData[roomId]) {
                roomsData[roomId] = {
                    host: socket.id,
                    users: []
                };
                console.log(`👑 ${socket.id} est le host de la room ${roomId}`);
            }

            // Ajouter l’utilisateur à la liste
            roomsData[roomId].users.push(socket.id);

            // Notifier le front
            io.to(roomId).emit("participants_update", roomsData[roomId].users);
            io.to(roomId).emit("host_update", roomsData[roomId].host);
        });

        // ------------------------------------------
        // 🎬 Synchronisation vidéo : PLAY
        // ------------------------------------------
        socket.on("video_play", (data) => {
            // data = { roomId, currentTime }
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
        // 🔁 Demande de synchronisation (nouvel arrivant)
        // ------------------------------------------
        socket.on("video_sync_request", (roomId) => {
            console.log(`🔄 Sync request room ${roomId}`);
            socket.to(roomId).emit("video_sync_request");
        });

        socket.on("video_sync_response", (data) => {
            // data = { roomId, currentTime, isPlaying }
            console.log(`📡 Sync response room ${data.roomId}`);
            socket.to(data.roomId).emit("video_sync_response", data);
        });

        // ------------------------------------------
        // 💬 Chat en temps réel
        // ------------------------------------------
        socket.on("chat_message", (data) => {
            // data = { roomId, username, message }
            console.log(`💬 Message room ${data.roomId} : ${data.username} → ${data.message}`);
            io.to(data.roomId).emit("chat_message", data);
        });

        // ------------------------------------------
        // ❌ Déconnexion d’un utilisateur
        // ------------------------------------------
        socket.on("disconnect", () => {
            console.log("🔴 Déconnecté :", socket.id);

            // Supprimer l’utilisateur de toutes les rooms où il était
            for (const roomId in roomsData) {
                const room = roomsData[roomId];

                if (!room) continue;

                // Supprimer l'utilisateur
                room.users = room.users.filter(u => u !== socket.id);

                // Si c'était le host → donner le host au prochain utilisateur
                if (room.host === socket.id) {
                    room.host = room.users[0] || null;
                    console.log(`👑 Nouveau host pour ${roomId} : ${room.host}`);
                    io.to(roomId).emit("host_update", room.host);
                }

                // Envoyer la nouvelle liste des participants
                io.to(roomId).emit("participants_update", room.users);
            }
        });
    });
};
