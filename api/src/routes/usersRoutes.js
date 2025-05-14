const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { keycloakProtect } = require("../middleware/authMiddleware");
const { userValidationRules } = require("../middleware/validationMiddleware");

router.get(
  "/:id",
  userValidationRules.getById,
  keycloakProtect(),
  usersController.getUserById
);
router.put(
  "/:id",
  userValidationRules.updateById,
  keycloakProtect(),
  usersController.updateUser
);
router.get(
  "/me",
  userValidationRules.getCurrent,
  keycloakProtect(),
  usersController.getCurrentUser
);
router.put(
  "/me",
  userValidationRules.updateCurrent,
  keycloakProtect(),
  usersController.updateCurrentUser
);

module.exports = router;
