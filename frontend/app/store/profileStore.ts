import { create } from "zustand";
import { Profile } from "../types/profile";
import { Post } from "../types/post";
import api from "../lib/axios";

interface ProfileState {
  profile: Profile | null;
  posts: Post[];
  savedPosts: Post[];
  loading: boolean;

  setProfile: (profile: Profile) => void;
  setLoading: (value: boolean) => void;

  fetchProfile: (id: string) => Promise<void>;
  fetchPosts: (id: string) => Promise<void>;
  fetchSavedPosts: () => Promise<void>;

  updateFollowState: (isFollowing: boolean) => void;
  updateProfileData: (data: Profile) => void;

  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  posts: [],
  savedPosts: [],
  loading: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (value) => set({ loading: value }),

  fetchProfile: async (id) => {
    if (get().profile?.id === id) return;

    set({ loading: true });

    try {
      const { data } = await api.get(`/user/${id}`);

      set({
        profile: data,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);

      set({
        loading: false,
        profile: null,
      });
    }
  },

  fetchPosts: async (id) => {
    if (get().posts.length > 0) return;

    try {
      const { data } = await api.get(`/user/${id}/posts`);

      set({ posts: data.posts });
    } catch (err) {
      console.error(err);
    }
  },

  fetchSavedPosts: async () => {
    if (get().savedPosts.length > 0) return;

    try {
      const { data } = await api.get(`/post/saved`);

      set({ savedPosts: data.posts });
    } catch (err) {
      console.error(err);
    }
  },

  updateFollowState: (isFollowing) =>
    set((state) =>
      state.profile
        ? {
            profile: {
              ...state.profile,
              isFollowing,
              followersCount: isFollowing
                ? state.profile.followersCount + 1
                : Math.max(0, state.profile.followersCount - 1),
            },
          }
        : {}
    ),

  updateProfileData: (data: Profile) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...data } } : {}
    ),

  clearProfile: () =>
    set({
      profile: null,
      posts: [],
      savedPosts: [],
    }),
}));