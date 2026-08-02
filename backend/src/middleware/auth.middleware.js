import { verifyToken } from "../utils/jwt.util.js";
import ApiError from "../utils/apiError.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { AUTH } from "../constants/messages.js";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED", AUTH.UNAUTHORIZED));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "TOKEN_INVALID", AUTH.TOKEN_INVALID));
  }
};

export default authenticate;
