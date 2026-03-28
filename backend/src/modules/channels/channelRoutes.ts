import express from "express";
import { requireAuth } from "../../middlewares/authMidleware.js";

import {
  createChannel,
  deleteChannel,
  getChannels,
  getChannel,
  sendChannelMessage,
  blockUserInChannel,
  unblockUserInChannel,
} from "./channelController.js";

const router = express.Router();

router.get("/", requireAuth, getChannels);
router.get("/:channelId", requireAuth, getChannel);

router.post("/", requireAuth, createChannel);
router.post("/:channelId/message", requireAuth, sendChannelMessage);
router.post("/:channelId/block", requireAuth, blockUserInChannel);
router.post("/:channelId/unblock", requireAuth, unblockUserInChannel);
router.delete("/:channelId", requireAuth, deleteChannel);

export default router;