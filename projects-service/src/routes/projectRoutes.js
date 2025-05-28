const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authMiddleware } = require("../middleware/authMiddleware");
const projectsStatsController = require("../controllers/projectsStatsController");

router.use(authMiddleware);
router.get("/stats", projectsStatsController.getProjectStats);
router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);


module.exports = router;
