import User from "../models/user.model.js";
import ApiError from "../utils/apiError.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { AUTH } from "../constants/messages.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "EMAIL_IN_USE", AUTH.EMAIL_IN_USE);
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", AUTH.INVALID_CREDENTIALS);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", AUTH.INVALID_CREDENTIALS);
  }

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
};
