const Joi = require("joi");
const moment = require("moment");

const signUpSchema = Joi.object({
  _id: Joi.string().optional(),
  firstname: Joi.string().trim().alphanum().required(),
  lastname: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9\\W]{3,30}$"))
    .optional(),
  mobile: Joi.string().length(10).optional(),
  role: Joi.string().valid("admin", "employee").allow("").optional(),
});

const loginSchema = Joi.object({
  _id: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

const employeeSchema = Joi.object({
  _id: Joi.string().optional(),
  emp_name: Joi.string().required().min(6).max(30),
  dept_name: Joi.string().required(),
  emp_code: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .pattern(/@rishabhsoft\.com$/),
});

const bookingSchema = Joi.object({
  BookingPerson: Joi.string().valid("Rise", "Employee", "Others").required(),
  BookingCategory: Joi.string().valid("Lunch", "Dinner").required(),
  isWeekend: Joi.boolean().optional(),
  Dates: Joi.object({
    startDate: Joi.date().min(moment().startOf("day").toDate()).required(),
    endDate: Joi.date()
      .min(Joi.ref("startDate"))
      .required(),
  }).required(),
  MealCounts: Joi.number().min(1).max(200).required(),
  Notes: Joi.string().allow("").optional(),
  Employees: Joi.when("BookingPerson", {
    is: "Employee",
    then: Joi.array().items(Joi.string().required()).required(),
    otherwise: Joi.optional(),
  }),
  CreatedBy: Joi.string().optional(),
  CreatedAt: Joi.date().optional(),
});

// const emailSchema = Joi.string()
//   .email({ minDomainSegments: 2, tlds: { allow: false } })
//   .pattern(/rishabhsoft\.com$/);

// const email = "example@rishabhsoft.com";

// const employee = {
//   emp_name: "bodhit darji",
//   dept_name: "frontend",
//   emp_code: "1234",
//   email: "example@rishabhsoft.com",
// };
// const validationResult = employeeSchema.validate(employee);

// if (validationResult.error) {
//   console.error("Validation error:", validationResult.error.message);
// } else {
//   console.log("is valid.");
// }

module.exports = { loginSchema, signUpSchema, employeeSchema, bookingSchema };
// const userSchema = Joi.object({
//   //we will store id's from signup collection after the registration of users done by admin or by own(employee).
//   id: Joi.string().required(),
//   // Correct the username field and set a default value
//   username: Joi.string()
//     .min(6)
//     .max(20) // Adjusted max length to accommodate concatenation
//     .required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9\\W]{3,30}$")),
// });
