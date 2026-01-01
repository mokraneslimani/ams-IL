const db = require("../db");

// Get user by id
exports.getUserById = (id) => {
  return db.query("SELECT * FROM users WHERE id = $1", [id]);
};

// Get all users
exports.getAllUsers = () => {
  return db.query("SELECT * FROM users");
};

exports.getUserByEmail = (email) => {
  return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

exports.getUserByUsername = (username) => {
  return db.query("SELECT * FROM users WHERE username = $1", [username]);
};

exports.createUser = (username, email, password) => {
  return db.query(
    `INSERT INTO users (username, email, password, bio, avatar)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [username, email, password, "", "avatar.png"]
  );
};

exports.updateUserProfile = (id, data) => {
  const allowedFields = ["bio", "avatar", "username", "email"];
  const fields = [];
  const values = [];
  let index = 1;

  allowedFields.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  });

  if (fields.length === 0) {
    throw new Error("Aucune donnee a mettre a jour");
  }

  values.push(id);

  const query = `
    UPDATE users SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *`;

  return db.query(query, values);
};
