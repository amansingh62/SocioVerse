import { Router } from "express";
import { getMe, login, logout, refresh, register } from "../auth/authController.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { loginSchema, registerSchema } from "./authSchema.js";
import { requireAuth } from "../../middlewares/authMidleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;