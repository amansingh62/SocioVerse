import { create } from "zustand";
import { Post } from "../types/post";
import { PostComment } from "../types/comment";
import api from "../lib/axios";
import { getSocket } from "../lib/socket";
import { useNotificationStore } from "./notificationStore";
import { useAuthStore } from "./authStore";

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
  profilePostIdsByUser: Record<string, string[]>;
  savedIds: string[];
  exploreIds: string[];

  nextCursor: string | null;
  loading: boolean;
  loadingFeed: boolean;
  loadingExplore: boolean;
  selectedTag: string | null;

  fetchFeed: () => Promise<void>;
  fetchExploreFeed: () => Promise<void>;
  loadMore: () => Promise<void>;

  getProfilePostIds: (userId: string) => string[];
  getProfilePosts: (userId: string) => Post[];

  ensureProfilePosts: (userId: string) => Promise<void>;
  ensureSavedPosts: () => Promise<void>;

  fetchProfilePosts: (userId: string) => Promise<void>;
  fetchAllComments: (postId: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  fetchSavedPosts: () => Promise<void>;

  setSelectedTag: (tag: string | null) => void;
  createPost: (payload: CreatePostPayload) => Promise<void>;

  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  addComment: (postId: string, content: string) => Promise<void>;

  initSocketListeners: () => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  postsById: {},

  feedIds: [],
  profilePostIdsByUser: {},
  savedIds: [],
  exploreIds: [],

  nextCursor: null,
  loading: false,
  loadingFeed: false,
  loadingExplore: false,
  selectedTag: null,

  setSelectedTag: (tag) => set({ selectedTag: tag }),

  fetchFeed: async () => {
    set({ loadingFeed: true });

    try {
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
        loadingFeed: false,
      }));
    } catch (err) {
      console.error(err);
      set({ loadingFeed: false });
    }
  },

  fetchExploreFeed: async () => {
    set({ loadingExplore: true });

    try {
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
        loadingExplore: false,
      }));
    } catch (err) {
      console.error(err);
      set({ loadingExplore: false });
    }
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

  getProfilePostIds: (userId) => {
    const state = get();
    return state.profilePostIdsByUser[userId] || [];
  },

  getProfilePosts: (userId) => {
    const state = get();
    const ids = state.profilePostIdsByUser[userId] || [];

    return ids.map((id) => state.postsById[id]).filter(Boolean);
  },

  ensureProfilePosts: async (userId: string) => {
    const state = get();

    if (!state.profilePostIdsByUser[userId]) {
      await state.fetchProfilePosts(userId);
    }
  },

  ensureSavedPosts: async () => {
    const state = get();

    if (state.savedIds.length === 0) {
      await state.fetchSavedPosts();
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
      profilePostIdsByUser: {
        ...state.profilePostIdsByUser,
        [userId]: unique(ids),
      },
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

  deleteComment: async (commentId: string, postId: string) => {
    await api.delete(`/post/comment/${commentId}`);

    set((state) => {
      const post = state.postsById[postId];
      if (!post || !post.comments) return state;

      const updatedComments = post.comments.filter((c) => c.id !== commentId);

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            comments: updatedComments,
            _count: {
              ...post._count,
              comments: Math.max(0, post._count.comments - 1),
            },
          },
        },
      };
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
  const post = get().postsById[postId];
  if (!post) return;

  const wasLiked = post.isLiked;
  const optimisticLiked = !wasLiked;
  const optimisticCount = post._count.likes + (optimisticLiked ? 1 : -1);

  set((state) => ({
    postsById: {
      ...state.postsById,
      [postId]: {
        ...state.postsById[postId],
        isLiked: optimisticLiked,
        _count: { ...state.postsById[postId]._count, likes: optimisticCount },
      },
    },
  }));

  try {
    const { data } = await api.post(`/post/${postId}/like`);
    recentLikedPostIds.add(postId);
    setTimeout(() => recentLikedPostIds.delete(postId), 5000);

    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: {
          ...state.postsById[postId],
          isLiked: data.isLiked,
          _count: {
            ...state.postsById[postId]._count,
            likes: state.postsById[postId]._count.likes + (data.isLiked === optimisticLiked ? 0 : data.isLiked ? 1 : -1),
          },
        },
      },
    }));
  } catch {
    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: {
          ...state.postsById[postId],
          isLiked: wasLiked,
          _count: { ...state.postsById[postId]._count, likes: post._count.likes },
        },
      },
    }));
  }
},

  toggleSave: async (postId) => {
  const post = get().postsById[postId];
  if (!post) return;

  const wasSaved = post.isSaved;
  const optimisticSaved = !wasSaved;

  set((state) => ({
    postsById: {
      ...state.postsById,
      [postId]: { ...state.postsById[postId], isSaved: optimisticSaved },
    },
    savedIds: optimisticSaved
      ? unique([...state.savedIds, postId])
      : state.savedIds.filter((id) => id !== postId),
  }));

  try {
    await api.post(`/post/${postId}/save`);
  } catch {
    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: { ...state.postsById[postId], isSaved: wasSaved },
      },
      savedIds: wasSaved
        ? unique([...state.savedIds, postId])
        : state.savedIds.filter((id) => id !== postId),
    }));
  }
},

  deletePost: async (postId) => {
    await api.delete(`/post/${postId}`);

    set((state) => {
      const map = { ...state.postsById };
      delete map[postId];

      return {
        postsById: map,

        feedIds: state.feedIds.filter((id) => id !== postId),
        savedIds: state.savedIds.filter((id) => id !== postId),

        profilePostIdsByUser: Object.fromEntries(
          Object.entries(state.profilePostIdsByUser).map(([userId, ids]) => [
            userId,
            ids.filter((id) => id !== postId),
          ]),
        ),
      };
    });
  },

  addComment: async (postId: string, content: string) => {
  const post = get().postsById[postId];
  if (!post) return;

  const tempId = `temp-${Date.now()}`;
  const user = useAuthStore.getState().user;

const optimisticComment: PostComment = {
  id: tempId,
  content,
  createdAt: new Date().toISOString(),
  optimistic: true,
  user: {
    id: user?.id ?? "",
    username: user?.username ?? "You",
    image: user?.image ?? null,
  },
};

  set((state) => ({
    postsById: {
      ...state.postsById,
      [postId]: {
        ...state.postsById[postId],
        comments: [optimisticComment, ...(state.postsById[postId].comments ?? [])],
        _count: {
          ...state.postsById[postId]._count,
          comments: state.postsById[postId]._count.comments + 1,
        },
      },
    },
  }));

  try {
    const { data } = await api.post(`/post/${postId}/comment`, { content });
    const comment: PostComment = data.comment ?? data;

    recentCommentIds.add(comment.id);
    setTimeout(() => recentCommentIds.delete(comment.id), 5000);

    set((state) => {
      const p = state.postsById[postId];
      if (!p) return state;
      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...p,
            comments: (p.comments ?? []).map((c) =>
              c.id === tempId ? comment : c
            ),
          },
        },
      };
    });
  } catch {
    set((state) => {
      const p = state.postsById[postId];
      if (!p) return state;
      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...p,
            comments: (p.comments ?? []).filter((c) => c.id !== tempId),
            _count: {
              ...p._count,
              comments: Math.max(0, p._count.comments - 1),
            },
          },
        },
      };
    });
  }
},

  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

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
      if (recentCommentIds.has(comment.id)) return;

      set((state) => {
        const post = state.postsById[postId];
        if (!post) return {};

        const alreadyExists = (post.comments ?? []).some(
          (c) => c.id === comment.id,
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
