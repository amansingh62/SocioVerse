"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Dashboard</h1>

        <Link href="/dashboard">Home</Link>
        <Link href="/dashboard/profile">Profile</Link>
        <Link href="/dashboard/messages">Messages</Link>
        <Link href="/dashboard/ads">Ads</Link>

        <button
          onClick={handleLogout}
          className="mt-auto bg-black text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}