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
});

// Create a Login model using the schema
const LoginModel = mongoose.model("login", loginSchema, "login");

// Export the Login model
module.exports = LoginModel;
