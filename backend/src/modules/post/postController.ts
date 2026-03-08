import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import cloudinary from "../../lib/cloudinary.js";
import { env } from "../../config/env.js";

export const createPost = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { content, mediaUrl, mediaType } = req.body;

 const post = await prisma.post.create({
  data: {
    content,
    mediaUrl,
    mediaType,
    authorId: userId as string,
  },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  },
});

  return res.status(StatusCodes.CREATED).json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const result = await prisma.post.deleteMany({
    where: {
      id,
      authorId: userId,
    },
  });

  if (result.count === 0) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Post not found or not allowed" });
  }

  return res.status(StatusCodes.OK).json({
    message: "Post deleted successfully",
  });
};

export const toggleLike = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  if (!userId)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: id,
      },
    },
  });

  let isLiked = false;

  if (existing) {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });

    isLiked = false;
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId: id,
      },
    });

    isLiked = true;
  }

  return res.json({ isLiked });
};

export const toggleSave = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  if (!userId)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unathorizedd" });

  const existing = await prisma.savedPosts.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: id,
      },
    },
  });

  if (existing) {
    await prisma.savedPosts.delete({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });
  } else {
    await prisma.savedPosts.create({
      data: {
        userId,
        postId: id,
      },
    });
  }

  return res.json({ saved: true });
};

export const addComment = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id: postId } = req.params as { id: string };
  const { content, parentId } = req.body;

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  if (!content || !content.trim()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Comment content is required" });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Post not found" });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId,
      postId,
      parentId: parentId ?? null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return res.status(StatusCodes.CREATED).json({ comment });
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.comment.delete({ where: { id } });

  res.json({ message: "Deleted" });
};

export const getFeed = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { cursor, limit = 10 } = req.query;

  if (!userId)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });

  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = following.map((f) => f.followingId);

  const posts = await prisma.post.findMany({
  where: {
    OR: [
      { authorId: userId },
      { authorId: { in: followingIds } }
    ]
  },
  take: Number(limit) + 1,
  skip: cursor ? 1 : 0,
  ...(cursor && { cursor: { id: cursor as string } }),
  orderBy: { createdAt: "desc" },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    savedBy: {
      where: {
        userId: userId as string
      },
      select: {
        id: true
      }
    }
  },
});

const formattedPosts = posts.map(({ savedBy, ...post }) => ({
  ...post,
  isSaved: Boolean((savedBy as { id: string }[] | undefined)?.length),
}));

  const nextCursor =
    formattedPosts.length > 0
      ? formattedPosts[formattedPosts.length - 1]?.id ?? null
      : null;

  return res.json({
    posts: formattedPosts,
    nextCursor
})
};

export const getCloudinarySignature = async (
  req: Request,
  res: Response
 ) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "posts",
    },
    env.CLOUDINARY_API_SECRET as string
  );

  res.json({
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD,
    folder: "posts",
  });
};

export const getSavedPosts = async (req: Request, res: Response) => {
  const userId = req.userId;

  const saved = await prisma.savedPosts.findMany({
    where: {
      userId: userId as string
    },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              image: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const posts = saved.map((s) => s.post);

  res.json({ posts });
};