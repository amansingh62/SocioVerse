import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { addComment, createPost, deleteComment, deletePost, 
    getCloudinarySignature, getFeed, getSavedPosts, toggleLike, toggleSave } from "./postController.js";

const router = Router();

router.get("/cloudinary-signature", requireAuth, getCloudinarySignature);
router.get("/feed", requireAuth, getFeed);
router.get("/saved", requireAuth, getSavedPosts);

router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

router.post("/:id/like", requireAuth, toggleLike);
router.post("/:id/save", requireAuth, toggleSave);

router.post("/:id/comment", requireAuth, addComment);
router.delete("/comment/:id", requireAuth, deleteComment);

export default router;