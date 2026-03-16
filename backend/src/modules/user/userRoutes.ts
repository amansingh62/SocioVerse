import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { getFeaturedProfile, getFollowers, getFollowing, getProfileUploadURL, getUserPosts, getUserProfile, updateProfile } from "./userController.js";

const router = Router();

router.get("/upload-url", requireAuth, getProfileUploadURL);
router.get("/profiles", requireAuth, getFeaturedProfile);

router.get("/:id/followers", requireAuth, getFollowers);
router.get("/:id/following", requireAuth, getFollowing);
router.get("/:id", requireAuth, getUserProfile);
router.get("/:id/posts", requireAuth, getUserPosts);

router.patch("/profile", requireAuth, updateProfile);

export default router;