const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateAndExtract } = require("../middleware/authMiddleware");
const { userValidationRules } = require("../middleware/validationMiddleware");

router.use(...authenticateAndExtract());

router.get(
  "/me",
  userValidationRules.getCurrent,
  usersController.getCurrentUser
);
router.patch(
  "/me",
  userValidationRules.updateCurrent,
  usersController.updateCurrentUser
);
router.get("/:id", userValidationRules.getById, usersController.getUserById);
router.patch(
  "/:id",
  userValidationRules.updateById,
  usersController.updateUser
);


module.exports = router;
