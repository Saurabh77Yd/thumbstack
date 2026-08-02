import express from "express";
import authRoutes from "./auth.routes.js";
import bookRoutes from "./book.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
