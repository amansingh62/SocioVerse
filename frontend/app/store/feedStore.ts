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

interface FeedState {
  posts: Post[];
  nextCursor: string | null;
  loading: boolean;

  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  addPost: (post: Post) => void;

  createPost: (payload: CreatePostPayload) => Promise<void>;

  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  addComment: (postId: string, content: string) => Promise<void>;
  incrementCommentCount: (postId: string) => void;
}



export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  nextCursor: null,
  loading: false,

  createPost: async (payload: CreatePostPayload) => {
  const optimisticPost = {
    id: "temp-" + Date.now(),
    content: payload.content,
    mediaUrl: payload.mediaUrl ?? null,
    mediaType: payload.mediaType ?? null,
    createdAt: new Date().toISOString(),
    optimistic: true,
    isSaved: false,
    author: payload.author,
    comments: [],
    _count: {
      likes: 0,
      comments: 0,
    },
  };

  const prevPosts = get().posts;

  set((state) => ({
    posts: [optimisticPost, ...state.posts],
  }));

  try {
    const { data } = await api.post("/post", payload);

    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === optimisticPost.id ? data : p
      ),
    }));
  } catch (err) {
    console.error(err);

    set({ posts: prevPosts });
  }
},

  fetchFeed: async () => {
    set({ loading: true });

    const { data } = await api.get("/post/feed");

    set({
      posts: data.posts,
      nextCursor: data.nextCursor,
      loading: false,
    });
  },

  loadMore: async () => {
    const { nextCursor, loading } = get();
    if (!nextCursor || loading) return;

    set({ loading: true });

    const { data } = await api.get("/post/feed", {
      params: { cursor: nextCursor },
    });

    set((state) => {
      const merged = [...state.posts, ...data.posts];

      const uniquePosts = Array.from(
        new Map(merged.map((p) => [p.id, p])).values()
      );

      return {
        posts: uniquePosts,
        nextCursor: data.nextCursor,
        loading: false,
      };
    });
  },

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts.filter((p) => p.id !== post.id)],
    })),

toggleLike: async (postId) => {
  const prevPosts = get().posts;

  try {
    const { data } = await api.post(`/post/${postId}/like`);

    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: data.isLiked,
              _count: {
                ...post._count,
                likes: data.isLiked
                  ? post._count.likes + 1
                  : post._count.likes - 1,
              },
            }
          : post
      ),
    }));
  } catch (err) {
    console.error(err);
    set({ posts: prevPosts });
  }
},

toggleSave: async (postId) => {
  const prevPosts = get().posts;

  set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved }
        : post
    ),
  }));

  try {
    await api.post(`/post/${postId}/save`);
  } catch (err) {
    console.error(err);
    set({ posts: prevPosts });
  }
},

deletePost: async (postId) => {
  const prevPosts = get().posts;

  set((state) => ({
    posts: state.posts.filter((post) => post.id !== postId),
  }));

  try {
    await api.delete(`/post/${postId}`);
  } catch (err) {
    console.error(err);
    set({ posts: prevPosts });
  }
},

addComment: async (postId, content) => {
  const optimisticComment: PostComment  = {
    id: "temp-" + Date.now(),
    content,
    user: {
      id: "me",
      username: "You",
      image: null,
    },
    parentId: null,
    createdAt: new Date().toISOString(),
    optimistic: true,
  };

  const prevPosts = get().posts;

  set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            comments: [optimisticComment, ...(post.comments ?? [])],
            _count: {
              ...post._count,
              comments: post._count.comments + 1,
            },
          }
        : post
    ),
  }));

  try {
    const { data } = await api.post(`/post/${postId}/comment`, { content });

    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments?.map((c) =>
                c.id === optimisticComment.id ? data : c
              ),
            }
          : post
      ),
    }));
  } catch (err) {
    console.error(err);

    set({ posts: prevPosts });
  }
},

  incrementCommentCount: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              _count: {
                ...post._count,
                comments: post._count.comments + 1,
              },
            }
          : post
      ),
    })),
}));