import { create } from "zustand";
import { User } from "../types/user";
import api from "../lib/axios";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchMe: async () => {
    try {
      const { data } = await api.get("/auth/me");

      set({
        user: data,
        isLoading: false,
      });

    } catch (err) {
      console.error(err);

      set({
        user: null,
        isLoading: false,
      });
    }
  },
}));