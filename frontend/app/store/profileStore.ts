import { create } from "zustand";
import { Profile } from "../types/profile";
import api from "../lib/axios";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;

  fetchProfile: (id: string) => Promise<void>;
  updateProfileData: (data: Profile) => void;
  updateFollowState: (isFollowing: boolean) => void;

  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

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
      console.error(err);
      set({ loading: false });
    }
  },

  updateProfileData: (data) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...data } } : {}
    ),

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

  clearProfile: () =>
    set({
      profile: null,
    }),
}));