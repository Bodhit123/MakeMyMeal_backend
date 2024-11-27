const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/apiResponse");

function PrivateRoutes(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    errorResponse(res, "Access denied", 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.jwt_access_token_secret_key);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    errorResponse(res, "Invalid token", 401);
  }
}

module.exports = PrivateRoutes;
