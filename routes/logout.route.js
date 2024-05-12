const express = require("express");
const LoginController = require("../controllers/Login.Controller");
const Router = express.Router();

// Route for login
Router.route("/").get(LoginController.Logout);
module.exports = Router;
