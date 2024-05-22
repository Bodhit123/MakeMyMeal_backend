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
    const { userId } = jwt.verify(token, process.env.jwt_secret_key);
    const user = await LoginModel.findById(userId).select("-password");

    if (!user) {
      return errorResponse(res, "Unauthorized User,user does not exist", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, "Unauthorized User,token not verified", 401);
  }
};

module.exports = checkUserAuth;
