"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { initSocket } from "../lib/socket";
import { usePostStore } from "../store/postStore";

import SupportChat from "@/app/components/SupportChat";
import TrendingHashtags from "@/app/components/TrendingHashtags";
import Advertisement from "@/app/components/Advertisment";
import FeaturedProfiles from "@/app/components/FeaturedProfiles";
import api from "../lib/axios";
import SearchBar from "../components/SearchBar";

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
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/live",
    label: "Live Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/advertise",
    label: "Advertise",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { fetchMe, isLoading, user } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
  };

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const initSocketListeners = usePostStore((s) => s.initSocketListeners);

  useEffect(() => {
    if (!user) return;
    const socket = initSocket();
    if (!socket) return;
    initSocketListeners();
    return () => { socket.disconnect(); };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen purple-mesh-bg">
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E056A4] dot-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E056A4] dot-pulse-2" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E056A4] dot-pulse-3" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="purple-mesh-bg w-full h-screen flex flex-col overflow-hidden">

      <div className="shrink-0 z-20">
        <SearchBar rightSlot={
          <button
            onClick={() => setDrawerOpen(true)}
            className="xl:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white"
            aria-label="Open explore panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 6h18M3 12h12M3 18h8" />
            </svg>
          </button>
        } />
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        <aside className="
          hidden xl:flex
          fixed left-0 top-0 bottom-0 w-88 z-10
          flex-col gap-4 px-4 py-8
          overflow-y-auto no-scrollbar
          pt-[calc(2rem+56px)]
        ">
          <div className="flex flex-col px-3 py-3 rounded-2xl flex-1 bg-[rgba(248,220,234,0.86)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[15px] border border-[rgba(248,220,234,0.3)]">
            <nav className="flex flex-col gap-0.5 flex-1">
              {NAV_ITEMS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px]
                    transition-all duration-150 group
                    ${pathname === href ? "bg-[#E056A4] text-white" : "text-[#000] hover:bg-[#E056A4] hover:text-white"}
                  `}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E056A4]">
                    {icon}
                  </span>
                  {label}
                </Link>
              ))}
            </nav>
            <p className="text-[11px] text-violet-900 mt-5 pl-1">v0.2.1</p>
          </div>

          <div className="flex flex-col gap-4">
            <SupportChat />
          </div>
        </aside>

        <main className="
          flex-1 overflow-y-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          xl:ml-72 xl:mr-80
          pb-20 xl:pb-0
        ">
          <div className="px-4 sm:px-6 xl:px-8 py-6 xl:py-8">
            {children}
          </div>
        </main>

        <aside className="
          hidden xl:flex
          fixed right-0 top-0 bottom-0 w-88 z-10
          flex-col gap-4 px-4 py-8
          overflow-y-auto no-scrollbar
          pt-[calc(2rem+56px)]
        ">
          <TrendingHashtags />
          <Advertisement />
          <FeaturedProfiles />
        </aside>
      </div>

      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 border-t border-[#E056A4]/20 bg-[rgba(248,220,234,0.95)] backdrop-blur-[16px]">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`
              flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
              text-[10px] font-medium transition-all duration-150
              ${pathname === href ? "text-[#E056A4]" : "text-[#E056A4]/50 hover:text-[#E056A4]"}
            `}
          >
            <span className={`
              flex items-center justify-center w-8 h-8 rounded-xl transition-all
              ${pathname === href ? "bg-[#E056A4] text-white" : "text-[#E056A4]/60"}
            `}>
              {icon}
            </span>
            <span className="hidden sm:block">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="xl:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">

        {supportOpen && (
          <div className="mb-2 w-72 rounded-2xl shadow-xl overflow-hidden bg-[rgba(248,220,234,0.97)] backdrop-blur-[16px] border border-[rgba(224,86,164,0.2)]">
            <SupportChat />
          </div>
        )}

        <button
          onClick={() => setSupportOpen((v) => !v)}
          className="w-12 h-12 rounded-full bg-[#E056A4] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
          aria-label="Support chat"
        >
          {supportOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>

      {drawerOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`
          xl:hidden fixed top-0 right-0 bottom-0 z-50 w-90 max-w-[80vw]
          flex flex-col gap-4 px-4 py-6 overflow-y-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          transition-transform duration-300 ease-in-out
          bg-[rgba(248,220,234,0.97)] backdrop-blur-[20px] border-l border-[rgba(224,86,164,0.2)]
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-semibold text-[#E056A4]">Explore</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E056A4]/10 text-[#E056A4] hover:bg-[#E056A4]/20 transition"
            aria-label="Close drawer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <TrendingHashtags />
        <Advertisement />
        <FeaturedProfiles />

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E056A4]/40 text-[#E056A4] text-sm font-medium transition-all hover:bg-[#E056A4] hover:text-white w-full justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign out
        </button>
      </div>
      </div>
  );
}