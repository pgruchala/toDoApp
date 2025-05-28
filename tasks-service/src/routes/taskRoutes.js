const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authMiddleware } = require("../middleware/authMiddleware");
const taskStatsController = require("../controllers/taskStatsController");

router.use(authMiddleware);
router.get("/stats", taskStatsController.getTaskStats);

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/:id", taskController.getTaskById);

module.exports = router;
