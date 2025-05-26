const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateAndExtract } = require("../middleware/authMiddleware");
const { authValidationRules } = require("../middleware/validationMiddleware");

router.post("/register",authValidationRules.register, authController.register);
router.post("/login",authValidationRules.login, authController.login);

router.post("/logout", ...authenticateAndExtract(), authController.logout);
router.get("/me", ...authenticateAndExtract(), authController.getProfile);

module.exports = router;
