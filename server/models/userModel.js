const db = require("../db");

// Récupérer un utilisateur par ID
exports.getUserById = (id) => {
    return db.query("SELECT * FROM users WHERE id = $1", [id]);
};

// Récupérer tous les utilisateurs
exports.getAllUsers = () => {
    return db.query("SELECT * FROM users");
};

// Créer un utilisateur
exports.createUser = (username, email, password) => {
    return db.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, password]
    );
};
