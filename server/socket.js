// socket.js
module.exports = function (io) {

    io.on("connection", (socket) => {
        console.log("🔌 Nouveau client connecté :", socket.id);

        // -------------------------------------
        // 🟦 Rejoindre une room
        // -------------------------------------
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`📌 ${socket.id} a rejoint la room ${roomId}`);

            // Notifier les autres
            socket.to(roomId).emit("user_joined", { userId: socket.id });
        });

        // -------------------------------------
        // 🟦 Lecture vidéo synchronisée
        // -------------------------------------
        socket.on("video_play", (data) => {
            // data = { roomId, currentTime }
            socket.to(data.roomId).emit("video_play", data);
        });

        socket.on("video_pause", (data) => {
            socket.to(data.roomId).emit("video_pause", data);
        });

        socket.on("video_seek", (data) => {
            // currentTime envoyé par le client
            socket.to(data.roomId).emit("video_seek", data);
        });

        // -------------------------------------
        // 🟦 Chat en temps réel
        // -------------------------------------
        socket.on("send_message", (data) => {
            // data = { roomId, username, message }
            io.to(data.roomId).emit("receive_message", data);
        });

        // -------------------------------------
        // 🟥 Déconnexion
        // -------------------------------------
        socket.on("disconnect", () => {
            console.log("❌ Déconnexion :", socket.id);
        });
    });

};
