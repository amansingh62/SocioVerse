import express from "express"
import { requireAuth } from "../../middlewares/authMidleware.js"
import { getMessages, getUserConversations, sendMessage } from "./messageController.js"

const router = express.Router()

router.get("/conversations", requireAuth, getUserConversations);
router.get("/:conversationId", requireAuth, getMessages);
router.post("/send", requireAuth, sendMessage);

export default router;