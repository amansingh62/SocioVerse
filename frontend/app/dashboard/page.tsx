"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useAuthStore } from "@/app/store/authStore";

export default function Dashboard() {
  useAuth();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-10">
      <h1>Welcome {user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}