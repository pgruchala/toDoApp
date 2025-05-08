const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authMiddleware } = require("../middleware/authMiddleware");

// brak zabezpieczeń
router.post("/", usersController.createUser);

//zabezpieczone endpointy

router.get("/:id", authMiddleware, usersController.getUserById);
router.patch("/:id", authMiddleware, usersController.updateUser);
router.get("/me", authMiddleware, usersController.getCurrentUser);
router.patch("/me", authMiddleware, usersController.updateCurrentUser);

module.exports = router;
