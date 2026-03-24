import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/websocket.js";

export const toggleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = req.userId;
    const { id: followingId } = req.params as { id: string };

    if (!followerId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    if (followerId === followingId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "You cannot follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    let isFollowing: boolean;

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      isFollowing = false;
    } else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      isFollowing = true;
    }

    const [targetCounts, currentCounts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followingId },
        select: {
          _count: { select: { followers: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: followerId },
        select: {
          _count: { select: { following: true } },
        },
      }),
    ]);

    if (isFollowing) {
      const io = getIO();

      const notification = await prisma.notification.create({
        data: {
          type: "FOLLOW",
          userId: followingId,
          actorId: followerId,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      });

      io.to(`user:${followingId}`).emit("notification", notification);
    }

    return res.status(StatusCodes.OK).json({
      message: isFollowing ? "Followed" : "Unfollowed",
      isFollowing,
      followersCount: targetCounts?._count.followers ?? 0,
      followingCount: currentCounts?._count.following ?? 0,
    });
  } catch (err: any) {
    console.error("TOGGLE FOLLOW ERROR:", err);

    if (err.code === "P2002") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Already following",
      });
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong" });
  }
};