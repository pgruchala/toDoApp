const { body, param, query } = require("express-validator");
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  next();
};

const authValidationRules = {
  login: [
    body("email")
      .notEmpty()
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email address is required"),
    body("password")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 8 characters long"),
    validateRequest,
  ],
  register: [
    body("email")
      .notEmpty()
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email address is required"),
    body("password")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 8 characters long"),
    ,
    body("firstName")
      .isLength({ max: 50 })
      .optional()
      .trim()
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .isLength({ max: 50 })
      .optional()
      .trim()
      .withMessage("Surname cannot exceed 50 characters"),
    validateRequest,
  ],
  logout: [body("refreshToken"), validateRequest],
  getProfile: [],
};
const userValidationRules = {
  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("New password must be at least 8 characters long"),
    validateRequest,
  ],
  adminActions: [
    body("email").notEmpty().isEmail().withMessage("Valid email is required"),
    validateRequest,
  ],
  getById: [param("id"), validateRequest],
  updateById: [
    param("id").notEmpty().withMessage("Invalid user ID"),
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),
    body("avatarUrl").optional().trim(),
    validateRequest,
  ],
  getCurrent: [], //keycloak(?)
  updateCurrent: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),
    body("avatarUrl").optional().trim(),
    validateRequest,
  ],
};
const taskValidationRules = {
  create: [
    body("title")
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Title is required"),
    body("description")
      .notEmpty()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description is required"),
    body("status")
      .optional()
      .trim()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage(
        "Status must be one of the following: pending, in-progress, completed"
      ),
    body("priority")
      .optional()
      .trim()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be one of the following: low, medium, high"),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Due date must be a valid date"),
    body("projectId")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Project ID must be a valid MongoDB ObjectId"),
    body("assignedTo").optional().trim(),
    validateRequest,
  ],
  update: [
    param("id").notEmpty().withMessage("Invalid task ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("status")
      .optional()
      .trim()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage(
        "Status must be one of the following: pending, in-progress, completed"
      ),
    body("priority")
      .optional()
      .trim()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be one of the following: low, medium, high"),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Due date must be a valid date"),
    body("projectId")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Project ID must be a valid MongoDB ObjectId"),
    body("assignedTo").optional().trim(),
    validateRequest,
  ],
  delete: [
    param("id").notEmpty().withMessage("Invalid task ID"),
    validateRequest,
  ],
  getById: [
    param("id").notEmpty().withMessage("Invalid task ID"),
    validateRequest,
  ],
  getAll: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt"])
      .withMessage("Sort by must be either createdAt or updatedAt"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be either asc or desc"),
    validateRequest,
  ],
};
const projectValidationRules = {
  create: [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Project name is required"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),

    validateRequest,
  ],
  update: [
    param("id").notEmpty().withMessage("Invalid project ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Project name cannot exceed 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    validateRequest,
  ],
  delete: [
    param("id").notEmpty().withMessage("Invalid project ID"),
    validateRequest,
  ],
  getById: [
    param("id").notEmpty().withMessage("Invalid project ID"),
    validateRequest,
  ],
};
module.exports = {
  authValidationRules,
  userValidationRules,
  taskValidationRules,
  projectValidationRules,
};
