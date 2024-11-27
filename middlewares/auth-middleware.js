const jwt = require("jsonwebtoken");
const LoginModel = require("../models/login.model.js");
const { errorResponse } = require("../utils/apiResponse");

var checkUserAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return errorResponse(res, "Unauthorized User, No Token", 401);
  }
  const token = authorization.split(" ")[1];
  try {
    const { userId } = jwt.verify(
      token,
      process.env.jwt_access_token_secret_key
    );
    const user = await LoginModel.findById(userId).select("-password");

    if (!user) {
      return errorResponse(res, "Unauthorized User,user does not exist", 401);
    }
    req.user = user;
    next();
    //if token is expired then it will throw an error of 403 and new token will be generated .
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, "Unauthorized User,token not verified", 403);
  }
};

module.exports = checkUserAuth;
