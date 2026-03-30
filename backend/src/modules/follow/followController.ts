import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/websocket.js";

export const toggleFollow = async (req: Request, res: Response) => {
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const targetUser = await tx.user.findUnique({
        where: { id: followingId },
        select: { id: true },
      });

      if (!targetUser) {
        throw new Error("NOT_FOUND");
      }

      const existing = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      let isFollowing = false;
      let notification: {
        id: string;
        type: string;
        userId: string;
        actorId: string;
        postId?: string | null;
        actor: { id: string; username: string; image: string | null };
      } | null = null;

      if (existing) {
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });
        isFollowing = false;
      } else {
        await tx.follow.create({
          data: {
            followerId,
            followingId,
          },
        });
        isFollowing = true;

        notification = await tx.notification.create({
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
      }

      const [targetCounts, currentCounts] = await Promise.all([
        tx.user.findUnique({
          where: { id: followingId },
          select: {
            _count: { select: { followers: true } },
          },
        }),
        tx.user.findUnique({
          where: { id: followerId },
          select: {
            _count: { select: { following: true } },
          },
        }),
      ]);

      return {
        isFollowing,
        notification,
        followersCount: targetCounts?._count.followers ?? 0,
        followingCount: currentCounts?._count.following ?? 0,
      };
    });

    const io = getIO();
    if (result.isFollowing && result.notification) {
      io.to(`user:${followingId}`).emit("notification", result.notification);
    }

    return res.status(StatusCodes.OK).json({
      message: result.isFollowing ? "Followed" : "Unfollowed",
      isFollowing: result.isFollowing,
      followersCount: result.followersCount,
      followingCount: result.followingCount,
    });

  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong" });
  }
};