import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { generateUploadURL } from "../../lib/s3.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const getUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const currentUser = req.userId;

  if (!id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User id required" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  let isFollowing = false;

  if (currentUser && currentUser !== id) {
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser,
          followingId: id,
        },
      },
    });

    isFollowing = !!existing;
  }

  return res.status(StatusCodes.OK).json({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    image: user.image,
    createdAt: user.createdAt,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { username, bio, image } = req.body;

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      bio,
      image,
      username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return res.status(StatusCodes.OK).json(updated);
};

export const getProfileUploadURL = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileType, fileSize } = req.query;

  if (!fileType || typeof fileType !== "string") {
    res.status(400).json({ message: "fileType required" });
    return;
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    res.status(400).json({ message: "Invalid file type" });
    return;
  }

  if (!fileSize || Number(fileSize) > MAX_FILE_SIZE) {
    res.status(400).json({ message: "File too large" });
    return;
  }

  const { url, key } = await generateUploadURL(fileType);

  res.json({ url, key });
};

export const getFollowers = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id) {
    return res.status(400).json({ message: "User id required" });
  }

  const followers = await prisma.follow.findMany({
    where: { followingId: id },
    select: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return res.status(200).json(followers.map((f) => f.follower));
};

export const getFollowing = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id) {
    return res.status(400).json({ message: "User id required" });
  }

  const following = await prisma.follow.findMany({
    where: { followerId: id },
    select: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return res.status(200).json(following.map((f) => f.following));
};