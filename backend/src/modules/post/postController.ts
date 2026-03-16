import type { Request, Response } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import cloudinary from "../../lib/cloudinary.js";
import { env } from "../../config/env.js";
import { getIO } from "../../lib/websocket.js";

function extractHashtags(content: string) {
  const matches = content.match(/#[a-zA-Z0-9_]+/g) || [];
  return matches.map(tag => tag.substring(1).toLowerCase());
}

export const createPost = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { content, mediaUrl, mediaType } = req.body;

  const hashtags = [...new Set(extractHashtags(content))];

  const post = await prisma.post.create({
    data: {
      content,
      mediaUrl,
      mediaType,
      authorId: userId as string,
    },
  });

  for(const tag of hashtags) {
    const hashtag = await prisma.hashTag.upsert({
      where: { tag },
      update: {
        count: { increment: 1 },
      }, 
      create: {
        tag,
        count: 1
      }
    });

    await prisma.postHashTag.create({
      data: {
        postId: post.id,
        hashtagId: hashtag.id,
      }
    })
  };

const fullPost = await prisma.post.findUnique({
  where: { id: post.id },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
    hashtags: {
      include: {
        hashTag: true,
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

 const formattedPost = {
    ...fullPost,
    hashtags: fullPost?.hashtags.map((h) => h.hashTag.tag) || [],
  };

    const trendingHashtags = await prisma.hashTag.findMany({
    orderBy: {
      count: "desc",
    },
    take: 5,
  });

  const io = getIO();
  io.emit("post:created", formattedPost);
  io.emit("hashtags:updated", trendingHashtags);

  return res.status(StatusCodes.CREATED).json(formattedPost);
};

export const deletePost = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const relations = await prisma.postHashTag.findMany({
    where: { postId: id },
  });

  await Promise.all(
    relations.map((relation) =>
      prisma.hashTag.update({
        where: { id: relation.hashtagId },
        data: {
          count: {
            decrement: 1,
          },
        },
      })
    )
  );

  await prisma.postHashTag.deleteMany({
    where: { postId: id },
  });

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

  await prisma.hashTag.deleteMany({
    where: {
      count: {
        lte: 0,
      },
    },
  });

  const trending = await prisma.hashTag.findMany({
    orderBy: {
      count: "desc",
    },
    take: 5,
  });

  const io = getIO();

  io.emit("post:deleted", id);
  io.emit("hashtags:updated", trending);

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

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Post not found" });
  }

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

  const io = getIO();

  if (isLiked && post.authorId !== userId) {
    const notification = await prisma.notification.create({
      data: {
        type: "LIKE",
        userId: post.authorId,
        actorId: userId,
        postId: id,
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

    io.to(`user:${post.authorId}`).emit("notification", notification);
    io.emit("post:liked", {
      postId: id,
    });
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
    select: { id: true, authorId: true },
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

  const io = getIO();

  if (post.authorId !== userId) {
    const notification = await prisma.notification.create({
      data: {
        type: "COMMENT",
        userId: post.authorId,
        actorId: userId,
        postId,
        commentId: comment.id,
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

    io.to(`user:${post.authorId}`).emit("notification", {
      ...notification,
      commentContent: comment.content,
    });

    io.emit("comment:created", {
      postId,
      comment,
    });
  }

  return res.status(StatusCodes.CREATED).json(comment);
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const { id } = req.params as { id: string };

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          authorId: true,
        },
      },
    },
  });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  const isCommentOwner = comment.userId === userId;
  const isPostOwner = comment.post.authorId === userId;

  if (!isCommentOwner && !isPostOwner) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.comment.delete({
    where: { id },
  });

  res.json({ message: "Deleted" });
};

export const getFeed = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { cursor, limit = 10 } = req.query;

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = following.map(
    (f: { followingId: string }) => f.followingId,
  );

  const posts = await prisma.post.findMany({
    where: {
      OR: [{ authorId: userId }, { authorId: { in: followingIds } }],
    },

    take: Number(limit) + 1,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor as string } }),

    orderBy: {
      createdAt: "desc",
    },

    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },

        hashtags: {
    include: {
      hashTag: true,
    },
  },

      comments: {
        take: 3,
        orderBy: {
          createdAt: "desc",
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
      },

      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },

      savedBy: {
        where: {
          userId: userId as string,
        },
        select: {
          id: true,
        },
      },
    },
  });

 const formattedPosts = posts.map(
  ({
    id,
    savedBy,
    comments,
    _count,
    hashtags,
    ...post
  }) => ({
    id,
    ...post,
    comments,
    _count,
    hashtags: hashtags.map((h) => h.hashTag.tag),
    isSaved: Boolean(savedBy?.length),
    hasMoreComments: _count.comments > comments.length,
  })
);

  const nextCursor =
    formattedPosts.length > Number(limit)
      ? (formattedPosts.pop()?.id ?? null)
      : null;

  return res.json({
    posts: formattedPosts,
    nextCursor,
  });
};

export const getExploreFeed = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { cursor, limit = 10 } = req.query;

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const posts = await prisma.post.findMany({
    take: Number(limit) + 1,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor as string } }),

    orderBy: {
      createdAt: "desc",
    },

    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },

       hashtags: {
    include: {
      hashTag: true,
    },
  },


      comments: {
        take: 3,
        orderBy: {
          createdAt: "desc",
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
      },

      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },

      savedBy: {
        where: {
          userId: userId as string,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const formattedPosts = posts.map(
  ({ savedBy, comments, _count, hashtags, ...post }) => ({
    ...post,
    comments,
    _count,
    hashtags: hashtags.map((h) => h.hashTag.tag),
    isSaved: Boolean(savedBy?.length),
    hasMoreComments: _count.comments > comments.length,
  })
);

  const nextCursor =
    formattedPosts.length > Number(limit)
      ? (formattedPosts.pop()?.id ?? null)
      : null;

  return res.json({
    posts: formattedPosts,
    nextCursor,
  });
};

export const getCloudinarySignature = async (req: Request, res: Response) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "posts",
    },
    env.CLOUDINARY_API_SECRET as string,
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
      userId: userId as string,
    },
    include: {
      post: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = saved.map((s: { post: unknown }) => s.post);

  res.json({ posts });
};

export const getPostComments = async (req: Request, res: Response) => {
  const { id: postId } = req.params as { id: string };

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },

    orderBy: {
      createdAt: "desc",
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

  return res.json({ comments });
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unathorized" });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      comment: {
        select: {
          content: true,
        },
      },
    },
  });

  res.json({ notifications });
};

export const getTrendingHashtags = async (req: Request, res: Response) => {
  const hashtags = await prisma.hashTag.findMany({
    orderBy: {
      count: "desc"
    },
    take: 5,
  });

  res.json(hashtags);
};

export const getPostsByHashtags = async (req: Request, res: Response) => {
  const { tag } = req.params;
  
  if(typeof tag !== "string") return res.status(StatusCodes.NOT_FOUND).json({ message: "Hashtag not found"});

  const posts = await prisma.post.findMany({
    where: {
      hashtags: {
        some: {
          hashTag: {
            tag,
          },
        },
      },
    }, 
   select: {
    id: true
   },
  });

  res.json(posts);
};
