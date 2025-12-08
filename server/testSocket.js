const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Client connecté :", socket.id);

    socket.emit("join_room", "12345");

    socket.emit("chat_message", {
        roomId: "12345",
        username: "ServerTest",
        message: "Hello depuis node !"
    });
});

socket.on("chat_message", (msg) => {
    console.log("Reçu :", msg);
});
