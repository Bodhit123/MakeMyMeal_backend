const express = require("express");
const Router = express.Router();
const { employeeValidationMiddleware } = require("../middlewares/validation");
const EmployeeController = require("../controllers/Employee.Controller");

Router.route("/").get(EmployeeController.getEmployeeDetails);
Router.route("/").post(employeeValidationMiddleware,EmployeeController.createNewEmployee);
Router.route("/:id").put(employeeValidationMiddleware,EmployeeController.updateEmployeeDetails);
Router.route("/:id").delete(EmployeeController.deleteEmployee);

// Other routes and configurations...
module.exports = Router;



