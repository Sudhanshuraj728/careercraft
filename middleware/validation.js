const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new ApiError(400, errorMessages);
  }
  next();
};

// Register validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  validate
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Resume analysis validation
const resumeAnalysisValidation = [
  body('resumeText')
    .trim()
    .notEmpty().withMessage('Resume text is required')
    .isLength({ min: 100 }).withMessage('Resume must be at least 100 characters'),
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  validate
];

// Company search validation
const companySearchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('industry')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Industry must be less than 50 characters'),
  validate
];

// MongoDB ObjectId validation
const objectIdValidation = (paramName = 'id') => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .isMongoId().withMessage(`Invalid ${paramName} format`),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  resumeAnalysisValidation,
  companySearchValidation,
  objectIdValidation
};
