const express = require("express");
const router = express.Router();
const taskController = require("../controllers/tasksController");
const { authenticateAndExtract } = require("../middleware/authMiddleware");
const { taskValidationRules } = require("../middleware/validationMiddleware");

router.use(...authenticateAndExtract());

router.post("/import", taskController.importTasks);
router.get("/export", taskController.exportTasks);

router.post("/", taskValidationRules.create, taskController.createTask);
router.get("/", taskValidationRules.getAll, taskController.getAllTasks);
router.get("/:id", taskValidationRules.getById, taskController.getTaskById);
router.patch("/:id", taskValidationRules.update, taskController.updateTask);
router.delete("/:id", taskValidationRules.delete, taskController.deleteTask);

module.exports = router;
