import { create } from "zustand";
import { Post } from "../types/post";
import { PostComment } from "../types/comment";
import api from "../lib/axios";

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

  nextCursor: string | null;
  loading: boolean;

  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>; 

  fetchProfilePosts: (userId: string) => Promise<void>;
  fetchSavedPosts: () => Promise<void>;

  createPost: (payload: CreatePostPayload) => Promise<void>;

  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  addComment: (postId: string, content: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  postsById: {},

  feedIds: [],
  profileIds: [],
  savedIds: [],

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
      feedIds: ids,
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
        feedIds: [...state.feedIds, ...ids],
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
      profileIds: ids,
    }));
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
      savedIds: ids,
    }));
  },

  createPost: async (payload) => {
    const tempId = "temp-" + Date.now();

    const optimisticPost: Post = {
      id: tempId,
      content: payload.content,
      mediaUrl: payload.mediaUrl ?? null,
      mediaType: payload.mediaType ?? null,
      createdAt: new Date().toISOString(),
      isSaved: false,
      isLiked: false,
      author: payload.author,
      comments: [],
      optimistic: true,
      _count: { likes: 0, comments: 0 },
    };

    set((state) => ({
      postsById: { ...state.postsById, [tempId]: optimisticPost },
      feedIds: [tempId, ...state.feedIds],
    }));

    try {
      const { data } = await api.post("/post", payload);

      set((state) => {
        const newPosts = { ...state.postsById };
        delete newPosts[tempId];
        newPosts[data.id] = data;

        return {
          postsById: newPosts,
          feedIds: state.feedIds.map((id) => (id === tempId ? data.id : id)),
        };
      });
    } catch {
      set((state) => ({
        feedIds: state.feedIds.filter((id) => id !== tempId),
      }));
    }
  },

  toggleLike: async (postId) => {
    const { data } = await api.post(`/post/${postId}/like`);

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      const diff =
        post.isLiked === data.isLiked ? 0 : data.isLiked ? 1 : -1;

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
          ? [...state.savedIds, postId]
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

  addComment: async (postId, content) => {
    const tempId = "temp-" + Date.now();

    const optimistic: PostComment = {
      id: tempId,
      content,
      user: { id: "me", username: "You", image: null },
      parentId: null,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            comments: [optimistic, ...(post.comments ?? [])],
            _count: {
              ...post._count,
              comments: post._count.comments + 1,
            },
          },
        },
      };
    });

    const { data } = await api.post(`/post/${postId}/comment`, { content });

    set((state) => {
      const post = state.postsById[postId];
      if (!post) return {};

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            comments: post.comments?.map((c) =>
              c.id === tempId ? data : c
            ),
          },
        },
      };
    });
  },
}));