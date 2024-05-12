const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  if (req.body) {
    console.log(req.body);
  }

  let message;

  message = {
    type: err.name,
    description: err.message || "Internal Server Error",
  };

  const statusCode = err.statusCode || 500;
  console.error(`${err.name}:`, err.message);
  errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
