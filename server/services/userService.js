const User = require("../models/userModel");

const userService = {
  async getAllUsers() {
    const result = await User.getAllUsers();
    return result.rows;
  },

  async getUserById(id) {
    const result = await User.getUserById(id);
    return result.rows[0] || null;
  },

  async createUser({ username, email, password }) {
    const result = await User.createUser(username, email, password);
    return result.rows[0];
  },

  async updateUserProfile(userId, data) {
    const allowed = ["bio", "avatar", "username", "email"];
    const payload = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        payload[key] = data[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Aucune donnee a mettre a jour");
    }

    if (payload.email) {
      const existing = await User.getUserByEmail(payload.email);
      if (existing.rows.length > 0 && existing.rows[0].id !== Number(userId)) {
        throw new Error("Email deja utilise");
      }
    }

    if (payload.username) {
      const existing = await User.getUserByUsername(payload.username);
      if (existing.rows.length > 0 && existing.rows[0].id !== Number(userId)) {
        throw new Error("Nom d'utilisateur deja utilise");
      }
    }

    const result = await User.updateUserProfile(userId, payload);
    return result.rows[0] || null;
  }
};

module.exports = userService;
