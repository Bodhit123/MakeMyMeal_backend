const express = require('express');
const SignUpController = require('../controllers/Signup.Controller');

const Router = express.Router();

// Route for signup
Router.route("/").post(SignUpController);

module.exports = Router;
