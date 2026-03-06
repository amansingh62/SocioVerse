import { create } from "zustand";
import { Post } from "../types/post";
import api from "../lib/axios";

interface FeedState {
    posts: Post[];
    nextCursor: string | null;
    loading: boolean;

    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    addPost: (post: Post) => void;
};

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    nextCursor: null,
    loading: false,

    fetchFeed: async () => {
        set({ loading: true });

        const { data } = await api.get("/post/feed");

        set({
            posts: data.posts,
            nextCursor: data.nextCursor,
            loading: false
        });
    },

    loadMore: async () => {
        const { nextCursor } = get();
        if(!nextCursor) return;

        const { data } = await api.get("/post/feed", {
            params: { cursor: nextCursor },
        });

        set((state) => ({
            posts: [...state.posts, ...data.posts],
            nextCursor: data.nextCursor,
        }));
    },

    addPost: (post) => 
        set((state) => ({
            posts: [post, ...state.posts],
        }))
}));