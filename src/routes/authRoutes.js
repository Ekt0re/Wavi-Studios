const express = require("express");
const router = express.Router();
const { register, login, getProfile } = require("../controllers/authController");
const { auth } = require("../middlewares/auth");

// Rotte pubbliche
router.post("/register", register);
router.post("/login", login);

// Rotte protette
router.get("/profile", auth, getProfile);

module.exports = router; 