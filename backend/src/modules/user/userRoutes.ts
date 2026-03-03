import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { getFollowers, getFollowing, getProfileUploadURL, getUserProfile, updateProfile } from "./userController.js";

const router = Router();

router.get("/upload-url", requireAuth, getProfileUploadURL);
router.get("/:id/followers", requireAuth, getFollowers);
router.get("/:id/following", requireAuth, getFollowing);
router.get("/:id", requireAuth, getUserProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;