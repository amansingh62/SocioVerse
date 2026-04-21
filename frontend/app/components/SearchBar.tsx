"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";
import Image from "next/image";

type User = {
  id: string;
  username: string;
  image?: string;
};

export default function SearchBar({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [recent, setRecent] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value) { setUsers([]); return; }
    debounceRef.current = setTimeout(async () => {
      const { data } = await api.get<User[]>(`/user/search?q=${encodeURIComponent(value)}`);
      setUsers(data);
    }, 100);
  };

  const selectUser = (user: User) => {
    setRecent((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev;
      return [user, ...prev].slice(0, 6);
    });
    setQuery("");
    setUsers([]);
    setFocused(false);
    setMobileSearchOpen(false);
    router.push(`/dashboard/profile/${user.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = query ? users : recent;
    if (!list.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => (p + 1) % list.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => (p <= 0 ? list.length - 1 : p - 1)); }
    if (e.key === "Enter" && selectedIndex >= 0) selectUser(list[selectedIndex]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !mobileInputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

useEffect(() => {
  if (mobileSearchOpen) {
    const t = setTimeout(() => {
      mobileInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(t);
  }
}, [mobileSearchOpen]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-[100]"
    >
      {!query && recent.length > 0 && (
        <>
          <div className="flex justify-between items-center px-4 pt-2.5 pb-1.5 text-[11px] text-[#AAAABC] font-bold tracking-widest uppercase">
            <span>Recent</span>
            <button
              onClick={() => setRecent([])}
              className="text-[#E91E8C] text-xs font-semibold bg-transparent border-none cursor-pointer"
            >
              Clear
            </button>
          </div>
          {recent.map((user, i) => (
            <UserItem key={user.id} user={user} active={i === selectedIndex} onClick={() => selectUser(user)} />
          ))}
        </>
      )}
      {query && users.map((user, i) => (
        <UserItem key={user.id} user={user} active={i === selectedIndex} onClick={() => selectUser(user)} />
      ))}
      {query && users.length === 0 && (
        <p className="py-4 text-center text-[13px] text-[#AAAABC]">No users found</p>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-[#c63c8c] to-[#a62c74] border-b border-white/10 shadow-[0_2px_20px_rgba(233,30,140,0.25)]">

      <div className="hidden xl:flex items-center px-8 h-[60px] relative">

        <div onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center">
          <Image src="/logo.png" alt="Socioverse" width={110} height={110} className="w-[110px] h-[110px] object-contain" />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 w-[360px]">
          <div className="relative">
            <div className="flex items-center gap-2.5 px-[18px] py-2.5 rounded-full bg-white/20 border border-white/30">
              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] shrink-0" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search users…"
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-white font-medium placeholder:text-white/60 font-sans"
              />
              {query && (
                <button onClick={() => { setQuery(""); setUsers([]); }} className="text-white/75 text-sm leading-none bg-transparent border-none cursor-pointer p-0">
                  ✕
                </button>
              )}
            </div>
            {focused && dropdown}
          </div>
        </div>

        <div className="ml-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/60 text-white text-sm font-medium transition-all duration-200 hover:bg-white hover:text-[#c63c8c]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      <div className="flex xl:hidden items-center px-4 h-[56px] gap-3">

        <div onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center">
          <Image src="/logo.png" alt="Socioverse" width={80} height={80} className="w-[80px] h-[80px] object-contain" />
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white"
          aria-label="Search"
        >
          {mobileSearchOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </button>

        {rightSlot}
      </div>

      {mobileSearchOpen && (
        <div className="xl:hidden px-4 pb-3 relative">
          <div className="flex items-center gap-2.5 px-[18px] py-2.5 rounded-full bg-white/20 border border-white/30">
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] shrink-0" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search users…"
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-white font-medium placeholder:text-white/60"
            />
            {query && (
              <button onClick={() => { setQuery(""); setUsers([]); }} className="text-white/75 text-sm leading-none bg-transparent border-none cursor-pointer p-0">
                ✕
              </button>
            )}
          </div>
          {focused && dropdown}
        </div>
      )}

    </header>
  );
}

function UserItem({ user, active, onClick }: { user: User; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150 ${active ? "bg-[#FCE4F1]" : "hover:bg-[#FBE9F0]"}`}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.username}
          width={34}
          height={34}
          className="w-[34px] h-[34px] rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-[#E91E8C] flex items-center justify-center text-white font-bold text-[13px]">
          {user.username[0].toUpperCase()}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-[#1C1C2E] leading-none">{user.username}</span>
        <span className="text-[12px] text-[#E91E8C] font-medium">@{user.username.toLowerCase()}</span>
      </div>
    </div>
  );
}