import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";

export const createChannel = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name } = req.body;

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  if (!name || !name.trim()) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel name required" });
  }

  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastChannelCreatedAt: true },
  });

  const fourteenDaysAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000
  );

  if (
    user?.lastChannelCreatedAt &&
    user.lastChannelCreatedAt >= fourteenDaysAgo
  ) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "You can create only one channel every 14 days",
    });
  }

  const expiresAt = new Date(
    now.getTime() + 8 * 24 * 60 * 60 * 1000
  );

  try {
    const channel = await prisma.$transaction(async (tx) => {
      await tx.channel.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      const count = await tx.channel.count();

      if (count >= 8) {
        throw new Error("Max 8 channels allowed");
      }

      const newChannel = await tx.channel.create({
        data: {
          name: name.trim(),
          creatorId: userId,
          expiresAt,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          lastChannelCreatedAt: now,
        },
      });

      return newChannel;
    });

    return res.status(StatusCodes.CREATED).json(channel);

  } catch (err: any) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: err.message || "Failed to create channel",
    });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { channelId } = req.params as { channelId: string };

  if(!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

  if(!channelId) return res.status(StatusCodes.NOT_FOUND).json({ message: "No channel found" });

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      creatorId: true
    }
  });

    if (!channel) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel not found" });
  }

  if(channel.creatorId !== userId) return res.status(StatusCodes.FORBIDDEN).json({ message: "Only channel owner can delete" });

    await prisma.channel.delete({
    where: { id: channelId },
  });

  return res.json({ message: "Channel deleted successfully" });
};

export const blockUserInChannel = async (req: Request, res: Response) => {
  const adminId = req.userId;
  const { channelId, userId } = req.body;

  if (!adminId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  if (!channelId || !userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing fields" });
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { creatorId: true },
  });

  if (!channel) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel not found" });
  }

  if (channel.creatorId !== adminId) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Not allowed" });
  }

  if (adminId === userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cannot block yourself" });
  }

  try {
    const blocked = await prisma.channelBlocked.create({
      data: {
        channelId,
        userId,
      },
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User blocked successfully",
      blocked,
    });

  } catch (err: any) {
    return res.status(400).json({
      message: "User already blocked",
    });
  }
};

export const unblockUserInChannel = async (req: Request, res: Response) => {
  const adminId = req.userId;
  const { channelId, userId } = req.body;

  if (!adminId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { creatorId: true },
  });

  if (!channel || channel.creatorId !== adminId) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Not allowed" });
  }

  await prisma.channelBlocked.deleteMany({
    where: {
      channelId,
      userId,
    },
  });

  return res.json({ message: "User unblocked" });
};

export const sendChannelMessage = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { channelId } = req.params as { channelId: string };
  const { content } = req.body;

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  if (!channelId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Channel ID required" });
  }

  if (!content || !content.trim()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Message content required" });
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { id: true, expiresAt: true },
  });

  if (!channel) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel not found" });
  }

  if (channel.expiresAt < new Date()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Channel expired" });
  }

  const blocked = await prisma.channelBlocked.findUnique({
    where: {
      channelId_userId: {
        channelId,
        userId,
      },
    },
  });

  if (blocked) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "You are blocked in this channel",
    });
  }

  const message = await prisma.channelMessage.create({
    data: {
      content: content.trim(),
      channelId,
      senderId: userId,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
  });

  await prisma.channel.update({
    where: { id: channelId },
    data: { lastMessageAt: new Date() },
  });

  return res.status(StatusCodes.CREATED).json(message);
};

export const getChannels = async (req: Request, res: Response) => {
  const now = new Date();

  await prisma.channel.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  const channels = await prisma.channel.findMany({
    where: {
      expiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastMessageAt: true,
      creator: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc", 
    },
  });

  return res.json(channels);
};

export const getChannel = async (req: Request, res: Response) => {
  const { channelId } = req.params as { channelId: string };

  if (!channelId) {
    return res.status(400).json({ message: "Channel ID required" });
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      creator: {
        select: {
          id: true,
          username: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        take: 50, 
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  if (channel.expiresAt < new Date()) {
    return res.status(400).json({ message: "Channel expired" });
  }

  return res.json(channel);
};