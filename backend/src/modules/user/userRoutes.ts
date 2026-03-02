import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { getUserProfile, updateProfile } from "./userController.js";

const router = Router();

router.get("/:id", requireAuth, getUserProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;