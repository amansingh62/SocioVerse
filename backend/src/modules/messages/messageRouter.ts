import express from "express"
import { requireAuth } from "../../middlewares/authMidleware.js"
import { conversationStart, deleteMessage, getMessages, getUserConversations, sendMessage } from "./messageController.js"

const router = express.Router()

router.get("/conversations", requireAuth, getUserConversations);
router.get("/:conversationId", requireAuth, getMessages);

router.post("/start", requireAuth, conversationStart);
router.post("/send", requireAuth, sendMessage);
router.patch("/:messageId", requireAuth, deleteMessage);

export default router;