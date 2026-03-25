import { create } from "zustand";
import { Profile } from "../types/profile";
import api from "../lib/axios";
import { usePostStore } from "./postStore";

type UpdateProfilePayload = {
  username: string;
  bio: string;
  image: string;
};

interface ProfileState {
  profilesById: Record<string, Profile>;
  featuredIds: string[];
  loading: boolean;

  fetchProfile: (id: string) => Promise<void>;
  ensureProfile: (id: string) => Promise<void>;

  setFeaturedProfiles: (profiles: Profile[]) => void;

  updateProfile: (
    payload: UpdateProfilePayload,
    userId: string,
  ) => Promise<void>;

  toggleFollow: (targetUserId: string, currentUserId: string) => Promise<void>;

  clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profilesById: {},
  loading: false,
  featuredIds: [],

  fetchProfile: async (id) => {
    set({ loading: true });

    try {
      const { data } = await api.get(`/user/${id}`);

      set((state) => ({
        profilesById: {
          ...state.profilesById,
          [id]: {
            ...state.profilesById[id],
            ...data,
          },
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  ensureProfile: async (id) => {
    const state = get();
    const existing = state.profilesById[id];

    if (existing && existing.bio !== undefined) return;

    await state.fetchProfile(id);
  },

  setFeaturedProfiles: (profiles) =>
    set((state) => {
      const map = { ...state.profilesById };
      const ids: string[] = [];

      profiles.forEach((p: Profile) => {
        map[p.id] = {
          ...map[p.id],
          id: p.id,
          username: p.username,
          image: p.image || undefined,
          followersCount: p.followersCount ?? 0,
          followingCount: p.followingCount ?? 0,
          isFollowing: p.isFollowing,
        };

        ids.push(p.id);
      });

      return {
        profilesById: map,
        featuredIds: ids,
      };
    }),

  updateProfile: async (payload, userId) => {
  try {
    set({ loading: true });

    const { data } = await api.patch("/user/profile", payload);

    set((state) => ({
      profilesById: {
        ...state.profilesById,
        [userId]: {
          ...state.profilesById[userId],
          ...data,
        },
      },
    }));
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    set({ loading: false });
  }
},

  toggleFollow: async (targetUserId, currentUserId) => {
    if (targetUserId === currentUserId) return;

    try {
      const { data } = await api.post(`/follow/${targetUserId}`);

      const postStore = usePostStore.getState();

      set((state) => {
        const target = state.profilesById[targetUserId];
        const current = state.profilesById[currentUserId];

        if (!target) return state;

        const isNowFollowing = data.isFollowing;

        return {
          profilesById: {
            ...state.profilesById,

            [targetUserId]: {
              ...target,
              isFollowing: isNowFollowing,
              followersCount: data.followersCount,
            },

            ...(current && {
              [currentUserId]: {
                ...current,
                followingCount: data.followingCount,
              },
            }),
          },
        };
      });

      if (data.isFollowing) {
        await postStore.fetchFeed();
      } else {
        usePostStore.setState((state) => ({
          feedIds: state.feedIds.filter((postId) => {
            const post = state.postsById[postId];
            return post?.author.id !== targetUserId;
          }),
        }));
      }
    } catch {}
  },

  clearProfiles: () => set({ profilesById: {} }),
}));
