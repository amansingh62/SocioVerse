import { useEffect } from "react";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        try {
          await api.post("/auth/refresh");
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [setUser, setLoading]);
};