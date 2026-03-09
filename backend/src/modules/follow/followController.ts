import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/websocket.js";

export const followUser = async (req: Request, res: Response) => {
   const followerId = req.userId;
   const { id: followingId } = req.params as { id: string };   

  if(!followerId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

   if(followerId === followingId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "You cannot follow yourself" });

   const targetUser = await prisma.user.findUnique({
    where: { id: followingId }
   });

   if(!targetUser) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

   const existing = await prisma.follow.findUnique({
    where: { 
        followerId_followingId: {
            followerId,
            followingId
        }
    }
   });

   if(existing) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Already following" });

   await prisma.follow.create({
    data: {
        followerId,
        followingId
    }
   });

   const counts = await prisma.user.findUnique({
    where: { id: followingId },
    select: {
        _count: {
            select: {
                followers: true,
                following: true
            },
        },
    },
   });

   const io = getIO();

if (followerId !== followingId) {

  const notification = await prisma.notification.create({
    data: {
      type: "FOLLOW",
      userId: followingId,
      actorId: followerId
    },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          image: true
        }
      }
    }
  });

  io.to(`user:${followingId}`).emit("notification", notification);
}

   return res.json({ 
    messsage: "Followed",
    followersCount: counts?._count.followers
   });
};

export const unfollowUser = async (req: Request, res: Response) => {
    const followerId = req.userId;
    const { id: followingId } = req.params as { id: string };

    if(!followerId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });

    const existing = await prisma.follow.findUnique({
        where: { followerId_followingId : {
            followerId,
            followingId
        }}
    });

    if(!existing) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Not following" });

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId
            }
        }
    });

    const counts = await prisma.user.findUnique({
        where: { id: followingId },
        select: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                }
            }
        }
    });

    return res.json({
        message: "Unliked successfully",
        followersCount: counts?._count.followers,
    });
};