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
};

module.exports = userService;
