class AppError extends Error {
  // only sent back operational error back to the client, not programming error or bug
  constructor(message, statusCode) {
    super(message); // new Error(message). call parent constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
