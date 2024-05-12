const express = require("express");
const LoginController = require("../controllers/Login.Controller");
const Router = express.Router();

Router.route("/").post(LoginController.ChangeUserPassword);

module.exports = Router;