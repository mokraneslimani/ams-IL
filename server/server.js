const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Servir les fichiers React
app.use(express.static(path.join(__dirname, "../client/build")));

// ⚠️ Utiliser /* au lieu de *
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(5000, () => {
  console.log("🚀 Serveur backend + frontend sur http://localhost:5000");
});
