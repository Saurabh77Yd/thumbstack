import ApiError from "../utils/apiError.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { COMMON } from "../constants/messages.js";
import config from "../config/env.js";

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "ROUTE_NOT_FOUND", COMMON.ROUTE_NOT_FOUND));
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, code, message } = err;

  if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST;
    code = "INVALID_ID";
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    code = "DUPLICATE_KEY";
    message = "A record with this value already exists";
  }

  if (!statusCode) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    code = "INTERNAL_SERVER_ERROR";
    message = COMMON.SERVER_ERROR;
  }

  if (config.env === "development" && !(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
