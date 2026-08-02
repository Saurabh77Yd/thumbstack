class ApiResponse {
  constructor(success, data, message) {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export const sendSuccess = (res, statusCode, data, message) => {
  return res.status(statusCode).json(new ApiResponse(true, data, message));
};
