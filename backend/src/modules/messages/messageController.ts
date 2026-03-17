import type { Request, Response } from "express"
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";

export const conversation = async (req: Request, res: Response) => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  if(!senderId || !receiverId) {
    return res.json(StatusCodes.NOT_FOUND).json({ message: "Invalid users" });
  };

  if(senderId == receiverId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Can't message yourself" });

  const conversation = await prisma.conversation.findFirst({
    where: {
        AND: [
            { members: { some: { id: senderId } } },
            { members: { some: { id: receiverId } } },
        ]
    },
    include: {
        members: {
            select: { id: true, username: true, image: true }
        }
    }
  });

  if(conversation) {
    return res.json(conversation);
  };

  const newConversation = await prisma.conversation.create({
    data: {
        members: {
            connect: [{ id: senderId }, { id: receiverId, }]
        }
    },

    include: {
        members: {
            select: { id: true, username: true, image: true }
        }
    }
  });

  res.json(newConversation);
};

export const sendMessage = async (req: Request, res: Response) => {
  const senderId = req.userId
  const { conversationId, content } = req.body

  if (!senderId || !conversationId || !content) {
    return res.status(400).json({ message: "Missing fields" })
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,

        conversation: {
          connect: { id: conversationId }
        },

        sender: {
          connect: { id: senderId }
        }
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true
          }
        }
      }
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    res.json(message)

  } catch (error) {
    res.status(500).json({ message: "Failed to send message" })
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params

  if(typeof conversationId !== "string") return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      orderBy: {
        createdAt: "asc"
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true
          }
        }
      }
    })

    res.json(messages)

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" })
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  const userId = req.userId!

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: { id: userId }
      }
    },

    include: {
      members: {
        select: {
          id: true,
          username: true,
          image: true
        }
      },

      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },

    orderBy: {
      updatedAt: "desc"
    }
  })

  const formatted = conversations.map((conv) => {
    const otherUser = conv.members.find((m) => m.id !== userId)

    return {
      conversationId: conv.id,
      user: otherUser,
      lastMessage: conv.messages[0] ?? null
    }
  })

  res.json(formatted)
};