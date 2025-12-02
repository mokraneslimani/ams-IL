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
