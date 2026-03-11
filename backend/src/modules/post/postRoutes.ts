import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { addComment, createPost, deleteComment, deletePost, 
    getCloudinarySignature, getExploreFeed, getFeed, getNotifications, getPostComments, getPostsByHashtags, getSavedPosts, getTrendingHashtags, toggleLike, toggleSave } from "./postController.js";

const router = Router();

router.get("/cloudinary-signature", requireAuth, getCloudinarySignature);
router.get("/feed", requireAuth, getFeed);
router.get("/explore", requireAuth, getExploreFeed);
router.get("/:id/comments", requireAuth, getPostComments);
router.get("/saved", requireAuth, getSavedPosts);
router.get("/notifications", requireAuth, getNotifications);
router.get("/hashtags/trending", requireAuth, getTrendingHashtags);
router.get("/hashtags/:tag", requireAuth, getPostsByHashtags);

router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

router.post("/:id/like", requireAuth, toggleLike);
router.post("/:id/save", requireAuth, toggleSave);

router.post("/:id/comment", requireAuth, addComment);
router.delete("/comment/:id", requireAuth, deleteComment);

export default router;