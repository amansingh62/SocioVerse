import { create } from "zustand";
import { Post } from "../types/post";
import { PostComment } from "../types/comment";
import api from "../lib/axios";
import { useAuthStore } from "./authStore";

const unique = (arr: string[]) => Array.from(new Set(arr));

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

  feedCursor: string | null;
  exploreCursor: string | null;
  hasFetchedSaved: boolean;

  loading: boolean;
  loadingFeed: boolean;
  loadingExplore: boolean;
  loadingMoreFeed: boolean;   
  loadingMoreExplore: boolean;
  loadingProfile: boolean;   

  selectedTag: string | null;

  fetchFeed: () => Promise<void>;
  fetchExploreFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadMoreExplore: () => Promise<void>;

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
}

export const usePostStore = create<PostState>((set, get) => ({
  postsById: {},

  feedIds: [],
  profilePostIdsByUser: {},
  savedIds: [],
  exploreIds: [],

  feedCursor: null,
  exploreCursor: null,
  hasFetchedSaved: false,

  loading: false,
  loadingFeed: false,
  loadingExplore: false,
  loadingMoreFeed: false,     
  loadingMoreExplore: false,
  loadingProfile: false,     

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
        feedCursor: data.nextCursor ?? null,
        loadingFeed: false,
      }));
    } catch (err) {
      console.error("fetchFeed error:", err);
      set({ loadingFeed: false });
    }
  },

  loadMoreFeed: async () => {
    const { feedCursor, loadingMoreFeed } = get();
    if (!feedCursor || loadingMoreFeed) return;  

    set({ loadingMoreFeed: true });
    try {
      const { data } = await api.get("/post/feed", {
        params: { cursor: feedCursor },
      });

      const map: Record<string, Post> = {};
      const ids: string[] = [];

      data.posts.forEach((p: Post) => {
        map[p.id] = p;
        ids.push(p.id);
      });

      set((state) => ({
        postsById: { ...state.postsById, ...map },
        feedIds: unique([...state.feedIds, ...ids]),
        feedCursor: data.nextCursor ?? null,
        loadingMoreFeed: false,
      }));
    } catch (err) {
      console.error("loadMoreFeed error:", err);
      set({ loadingMoreFeed: false });
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
        exploreCursor: data.nextCursor ?? null,
        loadingExplore: false,
      }));
    } catch (err) {
      console.error("fetchExploreFeed error:", err);
      set({ loadingExplore: false });
    }
  },

  loadMoreExplore: async () => {
    const { exploreCursor, loadingMoreExplore } = get();
    if (!exploreCursor || loadingMoreExplore) return; 

    set({ loadingMoreExplore: true });
    try {
      const { data } = await api.get("/post/explore", {
        params: { cursor: exploreCursor },
      });

      const map: Record<string, Post> = {};
      const ids: string[] = [];

      data.posts.forEach((p: Post) => {
        map[p.id] = p;
        ids.push(p.id);
      });

      set((state) => ({
        postsById: { ...state.postsById, ...map },
        exploreIds: unique([...state.exploreIds, ...ids]),
        exploreCursor: data.nextCursor ?? null,
        loadingMoreExplore: false,
      }));
    } catch (err) {
      console.error("loadMoreExplore error:", err);
      set({ loadingMoreExplore: false });
    }
  },

  fetchProfilePosts: async (userId) => {
    set({ loadingProfile: true });
    try {
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
        loadingProfile: false,
      }));
    } catch (err) {
      console.error("fetchProfilePosts error:", err);
      set({ loadingProfile: false });
    }
  },

  fetchAllComments: async (postId) => {
    try {
      const { data } = await api.get(`/post/${postId}/comments`);

      set((state) => {
        const post = state.postsById[postId];
        if (!post) return state;

        return {
          postsById: {
            ...state.postsById,
            [postId]: { ...post, comments: data.comments },
          },
        };
      });
    } catch (err) {
      console.error("fetchAllComments error:", err);
    }
  },

  deleteComment: async (commentId, postId) => {
    try {
      await api.delete(`/post/comment/${commentId}`);

      set((state) => {
        const post = state.postsById[postId];
        if (!post?.comments) return state;

        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
              _count: {
                ...post._count,
                comments: Math.max(0, post._count.comments - 1),
              },
            },
          },
        };
      });
    } catch (err) {
      console.error("deleteComment error:", err);
    }
  },

  addComment: async (postId, content) => {
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

      set((state) => {
        const p = state.postsById[postId];
        if (!p) return state;
        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...p,
              comments: (p.comments ?? []).map((c) =>
                c.id === tempId ? { ...comment, optimistic: false } : c
              ),
            },
          },
        };
      });
    } catch (err) {
      console.error("addComment error:", err);
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

fetchSavedPosts: async () => {
  const { hasFetchedSaved } = get();

  if (hasFetchedSaved) return;

  try {
    const { data } = await api.get("/post/saved");

    const map: Record<string, Post> = {};
    const ids: string[] = [];

    data.posts.forEach((p: Post) => {
      map[p.id] = p;
      ids.push(p.id);
    });

    set((state) => ({
      postsById: { ...state.postsById, ...map },
      savedIds: unique(ids),
      hasFetchedSaved: true,
    }));
  } catch (err) {
    console.error("fetchSavedPosts error:", err);
  }
},

  createPost: async (payload) => {
    try {
      const { data } = await api.post("/post", payload);

      set((state) => {
        const authorId = payload.author.id;
        const existingProfileIds = state.profilePostIdsByUser[authorId] ?? [];

        return {
          postsById: { ...state.postsById, [data.id]: data },
          feedIds: unique([data.id, ...state.feedIds]),
          profilePostIdsByUser: {
            ...state.profilePostIdsByUser,
            [authorId]: unique([data.id, ...existingProfileIds]),
          },
        };
      });
    } catch (err) {
      console.error("createPost error:", err);
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/post/${postId}`);

      set((state) => {
        const map = { ...state.postsById };
        delete map[postId];

        return {
          postsById: map,
          feedIds: state.feedIds.filter((id) => id !== postId),
          exploreIds: state.exploreIds.filter((id) => id !== postId),
          savedIds: state.savedIds.filter((id) => id !== postId),
          profilePostIdsByUser: Object.fromEntries(
            Object.entries(state.profilePostIdsByUser).map(([uid, ids]) => [
              uid,
              ids.filter((id) => id !== postId),
            ])
          ),
        };
      });
    } catch (err) {
      console.error("deletePost error:", err);
    }
  },

  toggleLike: async (postId) => {
    const post = get().postsById[postId];
    if (!post) return;

    const wasLiked = post.isLiked;
    const wasCount = post._count.likes;

    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: {
          ...state.postsById[postId],
          isLiked: !wasLiked,
          _count: {
            ...state.postsById[postId]._count,
            likes: wasCount + (wasLiked ? -1 : 1),
          },
        },
      },
    }));

    try {
      const { data } = await api.post(`/post/${postId}/like`);

      set((state) => ({
        postsById: {
          ...state.postsById,
          [postId]: {
            ...state.postsById[postId],
            isLiked: data.isLiked,
            _count: {
              ...state.postsById[postId]._count,
              likes: data.likesCount ?? wasCount + (data.isLiked ? 1 : -1),
            },
          },
        },
      }));
    } catch (err) {
      console.error("toggleLike error:", err);
      set((state) => ({
        postsById: {
          ...state.postsById,
          [postId]: {
            ...state.postsById[postId],
            isLiked: wasLiked,
            _count: {
              ...state.postsById[postId]._count,
              likes: wasCount,
            },
          },
        },
      }));
    }
  },

  toggleSave: async (postId) => {
    const post = get().postsById[postId];
    if (!post) return;

    const wasSaved = post.isSaved;

    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: { ...state.postsById[postId], isSaved: !wasSaved },
      },
      savedIds: !wasSaved
        ? unique([...state.savedIds, postId])
        : state.savedIds.filter((id) => id !== postId),
    }));

    try {
      await api.post(`/post/${postId}/save`);
    } catch (err) {
      console.error("toggleSave error:", err);
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
}));