const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { keycloakProtect } = require("../middleware/authMiddleware");
const { authValidationRules } = require("../middleware/validationMiddleware");

router.post("/register",authValidationRules.register, authController.register);
router.post("/login",authValidationRules.login, authController.login);
router.post("/logout", keycloakProtect(), authController.logout);
router.get("/me", keycloakProtect(), authController.getProfile);

module.exports = router;
