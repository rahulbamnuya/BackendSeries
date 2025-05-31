class ApiError extends Error {
  constructor(statusCode, message = "An error occurred", error = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
    this.isOperational = true; // Indicates that this is an operational error

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export {ApiError}