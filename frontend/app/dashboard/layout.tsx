"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "../lib/axios";
import { useAuthStore } from "@/app/store/authStore";
import { initSocket } from "../lib/socket";
import { usePostStore } from "../store/postStore";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { fetchMe, isLoading, user } = useAuthStore();

  useEffect(() => { fetchMe(); }, [fetchMe]);

const initSocketListeners = usePostStore(
  (s) => s.initSocketListeners
);

useEffect(() => {
  if (!user) return;

  const socket = initSocket();
  console.log("Connecting socket for user:", user.id);

  if (!socket) return;

  initSocketListeners();

  return () => {
    socket.disconnect();
  };
}, [user]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse" />
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-2" />
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-3" />
        </div>
      </div>
    );
  }

  if (!user) { router.replace("/login"); return null; }

  return (
    /* Full-viewport fixed container — nothing overflows */
    <div className="flex h-screen overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* ── Sidebar — fixed height, never scrolls ── */}
      <aside className="
        w-64 h-screen flex-shrink-0 z-10
        glass-card flex flex-col px-5 py-8
        border-r border-[rgba(201,150,122,0.15)]
      ">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="text-[#c9967a] text-xl">✦</span>
          <span className="font-display text-[23px] font-semibold tracking-widest text-[#1c1917]">
            Socioverse
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
            >
              <span className="text-[#c9967a] flex items-center">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2 mt-4 px-3.5 py-2.5 rounded-xl
            border border-[rgba(201,150,122,0.22)] text-[#a06050] text-sm font-medium
            bg-transparent cursor-pointer transition-all duration-200
            hover:bg-[rgba(201,150,122,0.08)] hover:border-[rgba(201,97,74,0.30)]
          "
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign out
        </button>
      </aside>

      {/* ── Main — scrolls independently, scrollbar hidden ── */}
      <main
        className="flex-1 h-screen overflow-y-scroll relative z-[1]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Hide scrollbar on webkit */}
        <style>{`main::-webkit-scrollbar { display: none; }`}</style>

        <div className="px-12 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}