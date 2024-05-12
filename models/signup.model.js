const mongoose = require("mongoose");

// Define the schema for user signup
const signupSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: false, // Password field is optional
  },
  mobile: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: false,
  },
});

// Create a Mongoose model for user signup
const SignupModel = mongoose.model("UserSignup", signupSchema, "UserSignup");

module.exports = SignupModel;
