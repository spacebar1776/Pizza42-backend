const {
  InvalidTokenError,
  UnauthorizedError,
} = require("express-oauth2-jwt-bearer");

const errorHandler = (error, request, response, next) => {
  console.error("AUTH ERROR:", error);

  if (error instanceof InvalidTokenError) {
    return response.status(error.status).json({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return response.status(error.status).json({
      message: error.message,
    });
  }

  response.status(500).json({
    message: error.message,
  });
};

module.exports = {
  errorHandler,
};