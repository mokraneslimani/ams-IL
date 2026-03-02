const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Connexion PostgreSQL
const db = require("./db");

const app = express();

// ==========================================
// CORS Configuration
// ==========================================
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());

// JSON parser
app.use(express.json());

// ==========================================
// Routes API (À METTRE AVANT REACT)
// ==========================================
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const historyRoutes = require("./routes/historyRoutes");
const friendRoutes = require("./routes/friendRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const cguRoutes = require("./routes/cguRoutes");

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/cgu", cguRoutes);

// Test route API
app.get("/api/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "Backend OK", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ==========================================
// Serve React frontend (PRODUCTION)
// ==========================================
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// ==========================================
// SOCKET.IO Setup
// ==========================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
  }
});

// Charger la logique WebSocket
const socketHandler = require("./socket");
socketHandler(io);

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur + WebSocket lancé sur http://localhost:${PORT}`);
});
