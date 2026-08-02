import express from "express";
import * as authController from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);

export default router;
