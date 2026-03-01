import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import api from "@/app/lib/axios";

export const useAuth = () => {
    const { setUser } = useAuthStore();

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
            }
        }
        loadUser();
    }, [setUser]);
};