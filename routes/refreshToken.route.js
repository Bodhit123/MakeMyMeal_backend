const express = require("express");
const RefreshTokenController = require("../controllers/RefreshToken.Controller");
const Router = express.Router();

// Route for login
Router.route("/").get(RefreshTokenController);
module.exports = Router;
