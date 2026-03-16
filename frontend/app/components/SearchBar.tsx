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

export default function SearchBar() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [recent, setRecent] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value) {
      setUsers([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const { data } = await api.get<User[]>(
        `/user/search?q=${encodeURIComponent(value)}`
      );
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

    router.push(`/dashboard/profile/${user.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = query ? users : recent;

    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % list.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? list.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter" && selectedIndex >= 0) {
      selectUser(list[selectedIndex]);
    }
  };

  const clearRecent = () => setRecent([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) {
        setFocused(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <header
      className="top-0 z-50 w-full"
      style={{
        background: "linear-gradient(180deg,#c63c8c 0%,#a62c74 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="flex justify-center px-8 py-2">
        <div className="w-full max-w-xl relative">

          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="1.8"
              fill="none"
              className="w-4 h-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none text-white text-[13.5px]"
            />

            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setUsers([]);
                }}
                className="text-white"
              >
                ✕
              </button>
            )}
          </div>

          {focused && (
            <div
              className="absolute w-full mt-2 rounded-xl overflow-hidden"
              style={{
                background: "white",
                boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
              }}
            >
              {!query && recent.length > 0 && (
                <>
                  <div className="flex justify-between px-4 py-2 text-xs text-gray-500">
                    <span>Recent</span>
                    <button
                      onClick={clearRecent}
                      className="text-pink-500"
                    >
                      Clear
                    </button>
                  </div>

                  {recent.map((user, i) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      active={i === selectedIndex}
                      onClick={() => selectUser(user)}
                    />
                  ))}
                </>
              )}

              {query &&
                users.map((user, i) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    active={i === selectedIndex}
                    onClick={() => selectUser(user)}
                  />
                ))}

              {query && users.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function UserItem({
  user,
  active,
  onClick,
}: {
  user: User;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors
      ${active ? "bg-pink-100" : "hover:bg-pink-50"}`}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.username}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
          {user.username[0].toUpperCase()}
        </div>
      )}

      <span className="text-sm text-gray-800 font-medium">
        @{user.username}
      </span>
    </div>
  );
}