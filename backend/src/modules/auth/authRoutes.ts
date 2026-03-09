import { Router } from "express";
import { checkUsername, getMe, login, logout, refresh, register } from "../auth/authController.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { loginSchema, registerSchema } from "./authSchema.js";
import { requireAuth } from "../../middlewares/authMidleware.js";

const router = Router();

router.get("/check-username", checkUsername);
router.get("/me", requireAuth, getMe);

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);

export default router;