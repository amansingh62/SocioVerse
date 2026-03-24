import type { Request, Response } from "express"
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/websocket.js";

export const creatChannel = async (req: Request, res: Response) => {
   const userId = req.userId;
   const { name } = req.body;

   if(!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

   if(!name || !name.trim()) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Not valid"});

   const channel = await prisma.channel.create({
    data:{
        name,
        creatorId: userId,
        members: {
            create: {
                userId,
                role: "ADMIN"
            }
        }
    }
   });

   return res.json(channel);
};

export const joinChannel = async (req: Request, res: Response) => {
    const userId = req.userId;
    const { channelId } = req.params;

    if(!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

    if(!channelId) return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel not found" });

    if(typeof channelId !== "string") return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid response"});

    const existing = await prisma.channelMember.findUnique({
        where: {
            userId_channelId: {
               userId,
               channelId
            }
        }
    });

    if(existing) return res.status(StatusCodes.FORBIDDEN).json({ message: "Already a member" });

    const member = await prisma.channelMember.create({
        data: {
            userId,
            channelId
        }
    });

    return res.status(StatusCodes.OK).json(member);
};

export const sendChannelMessage = async (req: Request, res: Response) => { 
    const userId = req.userId;
    const { channelId, content } = req.body;

    if(!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

    if(!channelId) return res.status(StatusCodes.NOT_FOUND).json({ message: "Channel not found" });

    if(typeof channelId !== "string") return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid response"});

    const existing = await prisma.channelMember.findUnique({
        where: {
            userId_channelId: {
                userId,
                channelId
            }
        }
    });

    if(!existing) return res.status(StatusCodes.NOT_FOUND).json({ message: "Not a member" });


    const message = await prisma.channelMessage.create({
        data: {
            content,
            channelId,
            senderId: userId
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
    });

    const io = getIO();

    io.to(channelId).emit("channelMessaage", message);

    return res.json(message);
};

export const removeMember = async (req: Request, res: Response) => {
    const adminId = req.userId;
    const { channelId, userId } = req.body;

    if(!adminId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

    const isAdmin = await prisma.channelMember.findUnique({
        where: {
            userId_channelId: {
                userId: adminId,
                channelId,
            }
        }
    });

    if(!isAdmin || isAdmin.role !== "ADMIN") {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Not allowed" });
    };

    await prisma.channelMember.delete({
        where: {
            userId_channelId: {
                userId,
                channelId
            }
        }
    });

    return res.json({ message: "User removed" });
};

export const deleteChannel = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { channelId } = req.params as { channelId: string };

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.creatorId !== userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await prisma.channel.delete({
    where: { id: channelId },
  });

  res.json({ message: "Channel deleted" });
};