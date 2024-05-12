const successResponse = (res, data = null, message = "Success", status) => {
  const statusCode = status || 200;
  const responseData = {
    message,
    data,
  };
  // Include token in the response if provided in the data object
  if (data && data.token) {
    responseData.token = data.token;
    delete data.token; // Remove token from the user data object
  }
  res.status(statusCode).json(responseData);
};

const errorResponse = (res, message = "Error", status) => {
  if (message && message.type) {
    // If message has a type property, create an object with type property inside message
    message = {
      message: {
        type: message.type,
        description: message.description || "Error",
      },
      statusCode: status || 500,
    };
  } else {
    // If message does not have a type property, create a simple message object
    message = {
      message: {
        type: "Error",
        description: message || "Error",
      },
      statusCode: status || 500,
    };
  }
  res.status(message.statusCode).json(message);
};

module.exports = { successResponse, errorResponse };
