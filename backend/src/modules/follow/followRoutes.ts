import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { toggleFollow } from "./followController.js";

const router = Router();

router.post("/:id", requireAuth, toggleFollow);

export default router;