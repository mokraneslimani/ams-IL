const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authService = {
  // ==========================
  //  REGISTER
  // ==========================
  async registerUser({ name, email, password }) {
    const existing = await User.getUserByEmail(email);
    if (existing.rows.length > 0) {
      throw new Error("Email déjà utilisé");
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await User.createUser(name, email, hashed);
    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user };
  },

  // ==========================
  //  LOGIN
  // ==========================
  async loginUser({ email, password }) {
    const result = await User.getUserByEmail(email);

    if (result.rows.length === 0) {
      throw new Error("Email incorrect");
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Mot de passe incorrect");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user };
  }
};

module.exports = authService;
