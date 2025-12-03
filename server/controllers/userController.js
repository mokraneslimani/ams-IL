const User = require("../models/userModel");

// récupérer tous les users
exports.getUsers = async (req, res) => {
    try {
        const result = await User.getAllUsers();
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// récupérer un user selon ID
exports.getUser = async (req, res) => {
    try {
        const result = await User.getUserById(req.params.id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// créer un user
exports.addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const result = await User.createUser(username, email, password);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) vérifier si l'utilisateur existe
    const result = await User.getUserByEmail(email);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email incorrect" });
    }

    const user = result.rows[0];

    // 2) vérifier le mot de passe (en clair pour l'instant)
    if (user.password !== password) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // 3) envoyer un faux token + user
    const fakeToken = "123456789TOKEN";

    res.json({ token: fakeToken, user });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
//   REGISTER USER
// ===============================
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body; // name = username

  try {
    // Vérifier si email existe déjà
    const existing = await User.getUserByEmail(email);

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Créer l'utilisateur
    const result = await User.createUser(name, email, password);

    const user = result.rows[0];

    // Token (fake)
    const fakeToken = "NEW_USER_TOKEN";

    res.status(201).json({ token: fakeToken, user });

  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};