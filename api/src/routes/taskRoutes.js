const express = require("express");
const router = express.Router();
const taskController = require("../controllers/tasksController");
const { setUpKeycloak } = require("../config/keycloak");
const { taskValidationRules } = require("../middleware/validationMiddleware");
const keycloak = setUpKeycloak();

router.use(keycloak.protect());

router.post("/", taskValidationRules.create, taskController.createTask);
router.get("/", taskValidationRules.getAll, taskController.getAllTasks);
router.get("/:id", taskValidationRules.getById, taskController.getTaskById);
router.patch("/:id", taskValidationRules.update, taskController.updateTask);
router.delete("/:id", taskValidationRules.create, taskController.deleteTask);

module.exports = router;
