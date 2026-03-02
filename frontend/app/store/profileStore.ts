import { create } from "zustand";
import { Profile } from "../types/profile";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;

  setProfile: (profile: Profile) => void;
  setLoading: (value: boolean) => void;
  updateFollowState: (isFollowing: boolean) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (value) => set({ loading: value }),

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

  clearProfile: () => set({ profile: null }),
}));
