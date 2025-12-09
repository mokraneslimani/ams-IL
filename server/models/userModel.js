const db = require("../db");

// Récupérer un utilisateur par ID
exports.getUserById = (id) => {
    return db.query("SELECT * FROM users WHERE id = $1", [id]);
};

// Récupérer tous les utilisateurs
exports.getAllUsers = () => {
    return db.query("SELECT * FROM users");
};

exports.getUserByEmail = (email) => {
  return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

exports.createUser = (username, email, password) => {
  return db.query(
    `INSERT INTO users (username, email, password, bio, avatar)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [username, email, password, "", "avatar.png"]
  );
  };
