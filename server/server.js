const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Connexion PostgreSQL (Supabase connection pooling)
const db = require("./db");

const app = express();

// ============================
// 🔥 CORS FIX (IMPORTANT !)
// ============================
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
}));
app.options("*", cors());

// Body parser
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

// Route test backend
app.get("/api/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "Backend OK", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
