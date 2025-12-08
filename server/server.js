const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Connexion PostgreSQL (Supabase connection pooling)
const db = require("./db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import des routes
const userRoutes = require("./routes/userRoutes");

// Utilisation des routes API
app.use("/api/users", userRoutes);
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);


// Route test backend + connexion BDD
app.get("/api/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "Backend OK", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Servir le frontend (si buildé)
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
