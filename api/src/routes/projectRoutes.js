const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectsController");
const { setUpKeycloak } = require("../config/keycloak");
const {
  projectValidationRules,
} = require("../middleware/validationMiddleware");
const keycloak = setUpKeycloak();

router.use(keycloak.protect());

router.post(
  "/",
  projectValidationRules.create,
  projectController.createProject
);
router.get("/", projectController.getAllProjects);
router.get(
  "/:id",
  projectValidationRules.getById,
  projectController.getProjectById
);
router.patch(
  "/:id",
  projectValidationRules.update,
  projectController.updateProject
);
router.delete(
  "/:id",
  projectValidationRules.delete,
  projectController.deleteProject
);

module.exports = router;
