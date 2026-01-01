const userService = require("../services/userService");
const authService = require("../services/authService");

// ===============================
//   GET ALL USERS
// ===============================
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   GET USER BY ID
// ===============================
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   UPDATE PROFILE (CURRENT USER)
// ===============================
exports.updateProfile = async (req, res) => {
  try {
    const updated = await userService.updateUserProfile(req.userId, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===============================
//   CREATE USER
// ===============================
exports.addUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//   LOGIN USER
// ===============================
exports.loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result); // { token, user }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===============================
//   REGISTER USER
// ===============================
exports.registerUser = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result); // { token, user }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
