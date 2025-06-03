const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authMiddleware } = require("../middleware/authMiddleware");
const taskStatsController = require("../controllers/taskStatsController");
const importExportController = require("../controllers/importExportController");

router.use(authMiddleware);
router.get("/stats", taskStatsController.getTaskStats);

router.get("/export", importExportController.exportTasks);
router.post("/import", importExportController.importTasks);

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/:id", taskController.getTaskById);

module.exports = router;
