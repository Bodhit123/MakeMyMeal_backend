const mongoose = require("mongoose");

// Define the schema for user signup
const employeeSchema = new mongoose.Schema({
  emp_name: {
    type: String,
  },
  dept_name: {
    type: String,
  },
  emp_code: {
    type: String,
  },
  email: {
    type: String,
  },
});

// Create a Mongoose model for user signup
const EmployeeModel = mongoose.model("employee_details", employeeSchema, "employee_details");

module.exports = EmployeeModel;
