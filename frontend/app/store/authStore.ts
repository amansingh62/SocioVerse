import { create } from "zustand";
import { User } from "../types/user";
import api from "../lib/axios";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;

  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchMe: async () => {
    try {
      set({ isLoading: true });

      const { data } = await api.get("/auth/me");

      set({ user: data });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));