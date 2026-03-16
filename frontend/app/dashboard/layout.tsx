"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "../lib/axios";
import { useAuthStore } from "@/app/store/authStore";
import { initSocket } from "../lib/socket";
import { usePostStore } from "../store/postStore";

import SupportChat from "@/app/components/SupportChat";
import TrendingHashtags from "@/app/components/TrendingHashtags";
import Advertisement from "@/app/components/Advertisment";
import FeaturedProfiles from "@/app/components/FeaturedProfiles";
import SearchBar from "../components/SearchBar";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/live",
    label: "Live Chat",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/game",
    label: "Games",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/advertise",
    label: "Advertise",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-[18px] h-[18px]"
      >
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
];

const LEFT_W = "w-90";
const RIGHT_W = "w-90";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { fetchMe, isLoading, user } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const initSocketListeners = usePostStore((s) => s.initSocketListeners);

  useEffect(() => {
    if (!user) return;
    const socket = initSocket();
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
    <div className="purple-mesh-bg w-full h-screen overflow-hidden flex flex-col">
      <div className="shrink-0 z-20">
        <SearchBar />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <aside
          className={`
            fixed left-0 top-0 bottom-0 ${LEFT_W} z-10
            flex flex-col gap-4 px-4 py-8
            overflow-y-auto no-scrollbar
            /* push down by SearchBar height — adjust if SearchBar height differs */
            pt-[calc(2rem+56px)]
          `}
        >
          <div
            className="flex flex-col px-3 py-3 rounded-2xl flex-1"
            style={{
              background: "rgba(248, 220, 234, 0.86)",
              borderRadius: "16px",
              boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
              backdropFilter: "blur(15.2px)",
              WebkitBackdropFilter: "blur(15.2px)",
              border: "1px solid rgba(248,220,234,0.3)",
            }}
          >
            <nav className="flex flex-col gap-0.5 flex-1">
              {NAV_ITEMS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px]
transition-all duration-150 group
${pathname === href ? "bg-[#E056A4] text-[#fff]" : "text-[#000] hover:bg-[#E056A4] hover:text-white"}
`}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg,#E056A4,#E056A4)",
                    }}
                  >
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

            <button
              onClick={handleLogout}
              className="
      flex items-center gap-2 px-3.5 py-2.5 rounded-xl
      border border-[#E056A4]/40 text-[#E056A4]
      text-sm font-medium transition-all duration-200
      hover:bg-[#E056A4] hover:text-white
    "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        <main
          className="
            flex-1 h-full overflow-y-auto no-scrollbar
            ml-72 mr-80          /* matches LEFT_W and RIGHT_W */
          "
        >
          <div className="px-8 py-8">{children}</div>
        </main>

        <aside
          className={`
            fixed right-0 top-0 bottom-0 ${RIGHT_W} z-10
            flex flex-col gap-4 px-4 py-8
            overflow-y-auto no-scrollbar
            pt-[calc(2rem+56px)]
          `}
        >
          <TrendingHashtags />
          <Advertisement />
          <FeaturedProfiles />
        </aside>
      </div>
    </div>
  );
}
