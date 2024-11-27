const SignUpModel = require("../models/signup.model");
const bcrypt = require("bcrypt");
const generateRandomPassword = require("../utils/passwordGenerator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const LoginModel = require("../models/login.model");
const sendMail = require("../utils/nodemailservice");

const SignUpController = async (req, res) => {
  try {
    const { firstname, lastname, email, mobile, role } = req.body;

    const randomPassword = generateRandomPassword(8);
    // Hash the random password using bcrypt
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create a new user instance with Mongoose
    const newUser = new SignUpModel({
      firstname,
      lastname,
      email,
      password: randomPassword,
      mobile,
      role: role.toLowerCase(),
    });
    // Determine if the user is an admin
    const isAdmin = role.toLowerCase() === "admin";
    // Save the user to the database
    await newUser.save();

    // Also save the login details
    await new LoginModel({
      email,
      password: hashedPassword,
      isAdmin: isAdmin
    }).save();
    // Send mail to the user with the randomly generated password
    // await sendMail(newUser.password, newUser.email);

    successResponse(res, newUser, "User signed up successfully", 201);
  } catch (error) {
    // Handle errors
    errorResponse(res, error.message, 400);
  }
};

module.exports = SignUpController;
