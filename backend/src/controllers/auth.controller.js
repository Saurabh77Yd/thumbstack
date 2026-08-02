import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { sendSuccess } from "../utils/apiResponse.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { AUTH } from "../constants/messages.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  sendSuccess(res, httpStatus.CREATED, result, AUTH.SIGNUP_SUCCESS);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, httpStatus.OK, result, AUTH.LOGIN_SUCCESS);
});

export const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, httpStatus.OK, null, AUTH.LOGOUT_SUCCESS);
});
