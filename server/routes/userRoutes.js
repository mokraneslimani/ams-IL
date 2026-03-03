const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// Get all users
router.get("/", userController.getUsers);

// Create user
router.post("/", userController.addUser);

router.post("/login", userController.loginUser);

// Create user (optional)
router.post("/register", userController.registerUser);

// Get current user
router.get("/me", auth, userController.getCurrentUser);

// Update profile for current user
router.put("/me", auth, userController.updateProfile);

// Get one user
router.get("/:id", userController.getUser);

module.exports = router;
