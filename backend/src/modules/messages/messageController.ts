import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/websocket.js";

export const conversationStart = async (req: Request, res: Response) => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid users" });
  }

  if (senderId === receiverId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Can't message yourself" });
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          members: {
            some: { userId: senderId },
          },
        },
        {
          members: {
            some: { userId: receiverId },
          },
        },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, image: true },
          },
        },
      },
    },
  });

  if (existingConversation) {
    return res.json(existingConversation);
  }

  const newConversation = await prisma.conversation.create({
    data: {},
  });

  await prisma.conversationMember.createMany({
    data: [
      { userId: senderId, conversationId: newConversation.id },
      { userId: receiverId, conversationId: newConversation.id },
    ],
  });

  const fullConversation = await prisma.conversation.findUnique({
    where: { id: newConversation.id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, image: true },
          },
        },
      },
    },
  });

  return res.json(fullConversation);
};

export const sendMessage = async (req: Request, res: Response) => {
  const senderId = req.userId;
  const { conversationId, content } = req.body;

  if (!senderId || !conversationId || !content) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const isMember = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: senderId,
      },
    });

    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
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

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    const io = getIO();

    io.to(`conversation:${conversationId}`).emit("receive_message", message);

    return res.json(message);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  if (typeof conversationId !== "string") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid conversationId" });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
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

    if (!conversation) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Conversation not found" });
    }

    return res.json({
      participants: conversation.members,
      messages: conversation.messages,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch messages" });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  const userId = req.userId!;

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: { userId: userId },
      },
    },

    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      },

      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  const formatted = conversations.map((conv) => {
    const otherUser = conv.members.find((m) => m.user.id !== userId)?.user;

    return {
      conversationId: conv.id,
      user: otherUser,
      lastMessage: conv.messages[0] ?? null,
    };
  });

  res.json(formatted);
};

export const deleteMessage = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { messageId } = req.params as { messageId: string };

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Not allowed to delete this message" });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: "This message was deleted",
        isDeleted: true,
      },
    });

    const io = getIO();

    io.to(`conversation:${message.conversationId}`).emit("message_deleted", {
      messageId: message.id,
    });

    return res.status(StatusCodes.OK).json(updatedMessage);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to delete the message" });
  }
};
