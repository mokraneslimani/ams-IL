const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Connexion PostgreSQL (Supabase)
const db = require("./db");

const app = express();

// ==========================================
// CORS Configuration
// ==========================================
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
}));
app.options("*", cors());

// JSON Body Parser
app.use(express.json());

// ==========================================
// Routes API
// ==========================================
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

// Test route
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
// Serve React frontend (production build)
// ==========================================
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// ==========================================
// Socket.io Setup
// ==========================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Load socket logic
const socketHandler = require("./socket");
socketHandler(io);

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Serveur + WebSocket lancé sur http://localhost:${PORT}`);
});
