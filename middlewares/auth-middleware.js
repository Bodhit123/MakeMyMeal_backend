const jwt = require("jsonwebtoken");
const LoginModel = require("../models/login.model.js");
const { errorResponse } = require("../utils/apiResponse");

var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      // verify token with the token got at login
      const { userId } = jwt.verify(token, process.env.jwt_secret_key);
      //get user from token
      req.user = await LoginModel.findById(userId).select("-password");
      next();
    } catch (error) {
      console.log(error.message);
      errorResponse(res, "Unauthorized User", 401);
    }
  }
  

  if (!token) {
    errorResponse(res, "Unauthorized User, No Token", 401);
  }
};

module.exports = checkUserAuth;
