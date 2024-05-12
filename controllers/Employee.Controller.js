const EmployeeModel = require("../models/employee.model.js");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getEmployeeDetails = async (req, res) => {
  const { searchQuery, limit } = req.query;
  let data;

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");
    data = await EmployeeModel.find({
      $or: [
        { emp_name: { $regex: regex } },
        { dept_name: { $regex: regex } },
        { emp_code: { $regex: regex } },
      ],
    }).limit(parseInt(limit));
  } else {
    data = await EmployeeModel.find().limit(parseInt(limit) || 10);
  }

  successResponse(res, data, "Fetched employee data successfully", 200);
};

const createNewEmployee = async (req, res) => {
  try {
    const { emp_name, dept_name, emp_code, email } = req.body;
    const employeeExist = await EmployeeModel.findOne({ emp_code });
    //check if employee already exist
    if (employeeExist) {
      return errorResponse(res, "Employee already exist", 409);
    }
    //else create a new employee model and save it to database
    await new EmployeeModel({
      emp_name,
      dept_name,
      emp_code,
      email,
    }).save();

    successResponse(res, "created successfully", 201);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

const updateEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    //find employee if exist or not
    const employee = await EmployeeModel.findById(id);

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    // Update employee details using Object.assign()
    Object.assign(employee, req.body);
    //save updates
    await employee.save();

    successResponse(
      res,
      employee,
      "Employee details updated successfully",
      200
    );
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    //if employee with id exist or not
    const employee = await EmployeeModel.findById(id);

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    await employee.deleteOne();

    successResponse(res, employee, "Employee deleted successfully", 200);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  getEmployeeDetails,
  createNewEmployee,
  updateEmployeeDetails,
  deleteEmployee,
};

//ask if you have to make put or patch request?

// app.patch("/rise/courses/:id")
// exports.updateEmployeeDetails = (req, res) => {
//   const student = students.find((s) => s.id === parseInt(req.params.id));
//   if (student) {
//     student.course = req.body.course;
//     res.json("Updated successfully.");
//   } else {
//     res.status(404).json("Student not found");
//   }
// };
