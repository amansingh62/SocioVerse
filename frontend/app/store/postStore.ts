import { create } from "zustand";
import { Post } from "../types/post";
import { PostComment } from "../types/comment";
import api from "../lib/axios";
import { getSocket } from "../lib/socket";
import { useNotificationStore } from "./notificationStore";

const unique = (arr: string[]) => Array.from(new Set(arr));

const recentCommentIds = new Set<string>();
const recentPostIds = new Set<string>();
const recentLikedPostIds = new Set<string>();

interface CreatePostPayload {
  content: string;
  mediaUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | null;
  author: {
    id: string;
    username: string;
    image: string | null;
  };
}

interface PostState {
  postsById: Record<string, Post>;

  feedIds: string[];
  profileIds: string[];
  savedIds: string[];
  exploreIds: string[];

  nextCursor: string | null;
  loading: boolean;

  fetchFeed: () => Promise<void>;
  fetchExploreFeed: () => Promise<void>;
  loadMore: () => Promise<void>;

  fetchProfilePosts: (userId: string) => Promise<void>;
  fetchAllComments: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  fetchSavedPosts: () => Promise<void>;

  createPost: (payload: CreatePostPayload) => Promise<void>;

  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  addComment: (
    postId: string,
    content: string,
    parentId?: string | null
  ) => Promise<void>;

  initSocketListeners: () => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  postsById: {},

  feedIds: [],
  profileIds: [],
  savedIds: [],
  exploreIds: [],

  nextCursor: null,
  loading: false,

  fetchFeed: async () => {
    const { data } = await api.get("/post/feed");

    const map: Record<string, Post> = {};
    const ids: string[] = [];

    data.posts.forEach((p: Post) => {
      map[p.id] = p;
      ids.push(p.id);
    });

    set((state) => ({
      postsById: { ...state.postsById, ...map },
      feedIds: unique(ids),
      nextCursor: data.nextCursor,
    }));
  },

  fetchExploreFeed: async () => {
    const { data } = await api.get("/post/explore");

    const map: Record<string, Post> = {};
    const ids: string[] = [];

    data.posts.forEach((p: Post) => {
      map[p.id] = p;
      ids.push(p.id);
    });

    set((state) => ({
      postsById: { ...state.postsById, ...map },
      exploreIds: unique(ids),
      nextCursor: data.nextCursor,
    }));
  },

  loadMore: async () => {
    const { nextCursor, loading } = get();
    if (!nextCursor || loading) return;

    set({ loading: true });

    try {
      const { data } = await api.get("/post/feed", {
        params: { cursor: nextCursor },
      });

      set((state) => {
        const map: Record<string, Post> = {};
        const ids: string[] = [];

        data.posts.forEach((p: Post) => {
          map[p.id] = p;
          ids.push(p.id);
        });

        return {
          postsById: { ...state.postsById, ...map },
          feedIds: unique([...state.feedIds, ...ids]),
          nextCursor: data.nextCursor,
          loading: false,
        };
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchProfilePosts: async (userId) => {
    const { data } = await api.get(`/user/${userId}/posts`);

    const map: Record<string, Post> = {};
    const ids: string[] = [];

    data.posts.forEach((p: Post) => {
      map[p.id] = p;
      ids.push(p.id);
    });

    set((state) => ({
      postsById: { ...state.postsById, ...map },
      profileIds: unique(ids),
    }));
  },

  fetchAllComments: async (postId) => {
    const { data } = await api.get(`/post/${postId}/comments`);

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            comments: data.comments,
          },
        },
      };
    });
  },

  deleteComment: async (commentId) => {
    await api.delete(`/post/comment/${commentId}`);

    set((state) => {
      const posts = { ...state.postsById };

      Object.values(posts).forEach((post) => {
        if (!post.comments) return;

        post.comments = post.comments.filter((c) => c.id !== commentId);
        post._count.comments = Math.max(0, post._count.comments - 1);
      });

      return { postsById: posts };
    });
  },

  fetchSavedPosts: async () => {
    const { data } = await api.get(`/post/saved`);

    const map: Record<string, Post> = {};
    const ids: string[] = [];

    data.posts.forEach((p: Post) => {
      map[p.id] = p;
      ids.push(p.id);
    });

    set((state) => ({
      postsById: { ...state.postsById, ...map },
      savedIds: unique(ids),
    }));
  },

  createPost: async (payload) => {
    try {
      const { data } = await api.post("/post", payload);

      recentPostIds.add(data.id);
      setTimeout(() => recentPostIds.delete(data.id), 5000);

      set((state) => ({
        postsById: { ...state.postsById, [data.id]: data },
        feedIds: unique([data.id, ...state.feedIds]),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  toggleLike: async (postId) => {
    const { data } = await api.post(`/post/${postId}/like`);

    recentLikedPostIds.add(postId);
    setTimeout(() => recentLikedPostIds.delete(postId), 5000);

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      const diff = post.isLiked === data.isLiked ? 0 : data.isLiked ? 1 : -1;

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            isLiked: data.isLiked,
            _count: {
              ...post._count,
              likes: post._count.likes + diff,
            },
          },
        },
      };
    });
  },

  toggleSave: async (postId) => {
    await api.post(`/post/${postId}/save`);

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      const saved = !post.isSaved;

      return {
        postsById: {
          ...state.postsById,
          [postId]: { ...post, isSaved: saved },
        },
        savedIds: saved
          ? unique([...state.savedIds, postId])
          : state.savedIds.filter((id) => id !== postId),
      };
    });
  },

  deletePost: async (postId) => {
    await api.delete(`/post/${postId}`);

    set((state) => {
      const map = { ...state.postsById };
      delete map[postId];

      return {
        postsById: map,
        feedIds: state.feedIds.filter((id) => id !== postId),
        profileIds: state.profileIds.filter((id) => id !== postId),
        savedIds: state.savedIds.filter((id) => id !== postId),
      };
    });
  },

  addComment: async (postId, content, parentId = null) => {
    try {
      const { data } = await api.post(`/post/${postId}/comment`, {
        content,
        parentId,
      });

      const comment: PostComment = data.comment ?? data;

      // Mark this id so the socket listener skips it
      recentCommentIds.add(comment.id);
      setTimeout(() => recentCommentIds.delete(comment.id), 5000);

      set((state) => {
        const post = state.postsById[postId];
        if (!post) return {};

        const alreadyExists = (post.comments ?? []).some(
          (c) => c.id === comment.id
        );
        if (alreadyExists) return state;

        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              comments: [comment, ...(post.comments ?? [])],
              _count: {
                ...post._count,
                comments: post._count.comments + 1,
              },
            },
          },
        };
      });
    } catch (err) {
      console.error(err);
    }
  },

  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.onAny((event, data) => {
      console.log("SOCKET EVENT:", event, data);
    });

    const addNotification = useNotificationStore.getState().addNotification;

    socket.off("post:created");
    socket.off("post:liked");
    socket.off("comment:created");
    socket.off("notification");

    socket.on("notification", async (data) => {
      await addNotification(data);
    });

    socket.on("post:created", (post) => {
      if (recentPostIds.has(post.id)) return;

      set((state) => {
        if (state.postsById[post.id]) return state;

        return {
          postsById: {
            ...state.postsById,
            [post.id]: post,
          },
          feedIds: unique([post.id, ...state.feedIds]),
        };
      });
    });

    socket.on("post:liked", ({ postId }) => {
      if (recentLikedPostIds.has(postId)) return;

      set((state) => {
        const post = state.postsById[postId];
        if (!post) return {};

        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              _count: {
                ...post._count,
                likes: post._count.likes + (post.isLiked ? -1 : 1),
              },
            },
          },
        };
      });
    });

    socket.on("comment:created", ({ postId, comment }) => {
      // Skip if addComment already inserted this comment
      if (recentCommentIds.has(comment.id)) return;

      set((state) => {
        const post = state.postsById[postId];
        if (!post) return {};

        // Guard against duplicate comments already added by addComment
        const alreadyExists = (post.comments ?? []).some(
          (c) => c.id === comment.id
        );
        if (alreadyExists) return state;

        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              comments: [comment, ...(post.comments ?? [])],
              _count: {
                ...post._count,
                comments: post._count.comments + 1,
              },
            },
          },
        };
      });
    });
  },
}));