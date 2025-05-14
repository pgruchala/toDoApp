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
  getProfile: [
    //chyba keycloak tym zarządza
  ],
};
const userValidationRules = {
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
module.exports = {
  authValidationRules,
  userValidationRules,
};
