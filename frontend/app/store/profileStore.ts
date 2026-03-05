import { create } from "zustand";
import { Profile } from "../types/profile";
import api from "../lib/axios";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;

  setProfile: (profile: Profile) => void;
  setLoading: (value: boolean) => void;
  fetchProfile: (id: string) => Promise<void>;
  updateFollowState: (isFollowing: boolean) => void;
  updateProfileData: (data: Profile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (value) => set({ loading: value }),

  fetchProfile: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/user/${id}`);
      set({ profile: data });
    } finally {
      set({ loading: false });
    }
  },

  updateFollowState: (isFollowing) =>
    set((state) =>
      state.profile
        ? {
            profile: {
              ...state.profile,
              isFollowing,
              followersCount: Math.max(
                0,
                isFollowing
                  ? state.profile.followersCount + 1
                  : state.profile.followersCount - 1,
              ),
            },
          }
        : {},
    ),

  updateProfileData: (data: Profile) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...data } } : {},
    ),

  clearProfile: () => set({ profile: null }),
}));
