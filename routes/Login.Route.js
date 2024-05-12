const express = require("express");
const {LoginController} = require("../controllers/Login.Controller");
const Router = express.Router();

// Route for login
Router.route("/").post(LoginController);
module.exports = Router;
