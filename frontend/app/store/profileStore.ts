import { create } from "zustand";
import { Profile } from "../types/profile";
import api from "../lib/axios";

type UpdateProfilePayload = {
  username: string;
  bio: string;
  image: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;

  fetchProfile: (id: string) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
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
    set({ profile: data });
  } catch (err) {
    console.error(err);
  } finally {
    set({ loading: false });
  }
},

updateProfile: async (payload) => {
  try {
    set({ loading: true });

    const { data } = await api.patch("/user/profile", payload);

    set((state) => ({
      profile: state.profile ? { ...state.profile, ...data } : data,
      loading: false
    }));

  } catch (err) {
    console.error(err);
    set({ loading: false });
      throw err;
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

  clearProfile: () =>
    set({
      profile: null,
    }),
}));