const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Récupérer tous les users
router.get("/", userController.getUsers);

// Récupérer 1 user
router.get("/:id", userController.getUser);

// Créer un user
router.post("/", userController.addUser);

router.post("/login", userController.loginUser);

// CREATE USER (OPTIONNEL)
router.post("/register", userController.registerUser);

module.exports = router;

