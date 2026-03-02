import type { Request, Response } from "express"
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";

export const getUserProfile = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if(!id) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized"});

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
         id: true,
         name: true,
         email: true,
         bio: true,
         image: true,
         createdAt: true,
         _count: {
            select: {
                followers: true,
                following: true
            }
         }
        }
    });

    if(!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

    return res.json({
        ...user,
        followersCount: user._count.followers,
        followingCount: user._count.following
    });
};

export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.userId;
    const { bio, image } = req.body;

    if(!userId) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            bio,
            image,
        },
        select: {
           id: true,
           name: true,
           bio: true,
           image: true
        }
    });

    return res.json(updated);
};