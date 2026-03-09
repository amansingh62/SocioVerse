import { Router } from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";
import { followUser, unfollowUser } from "./followController.js";
const router = Router();
router.post("/:id", requireAuth, followUser);
router.delete("/:id", requireAuth, unfollowUser);
export default router;
//# sourceMappingURL=followRoutes.js.map