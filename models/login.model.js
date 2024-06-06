const { required } = require("joi");
const mongoose = require("mongoose");

// Define the schema for the login
const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
});

// Create a Login model using the schema
const LoginModel = mongoose.model("login", loginSchema, "login");

// Export the Login model
module.exports = LoginModel;
