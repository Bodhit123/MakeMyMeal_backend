const {
  loginSchema,
  signUpSchema,
  employeeSchema,
  bookingSchema,
  disableSchema,
} = require("../models/schemas");

const isValid = (obj, schema) => {
  return schema.validate(obj, { abortEarly: false }).error;
};

const authMiddleware = (schema) => (req, res, next) => {
  const validationError = isValid(req.body, schema);
  if (validationError) {
    // If there's a validation error, pass it to the error handler middleware
    next(validationError);
  } else {
    // If validation succeeds, proceed to the next middleware or route handler
    next();
  }
};

const BookingValidationMiddleware = authMiddleware(bookingSchema);
const SettingValidationMiddleware = authMiddleware(disableSchema);
const employeeValidationMiddleware = authMiddleware(employeeSchema);
const signUpValidationMiddleware = authMiddleware(signUpSchema);
const loginValidationMiddleware = authMiddleware(loginSchema);

module.exports = {
  signUpValidationMiddleware,
  loginValidationMiddleware,
  employeeValidationMiddleware,
  BookingValidationMiddleware,
  SettingValidationMiddleware
};
