import * as dashboardService from "../services/dashboard.service.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { sendSuccess } from "../utils/apiResponse.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { DASHBOARD } from "../constants/messages.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  sendSuccess(res, httpStatus.OK, stats, DASHBOARD.FETCHED);
});
