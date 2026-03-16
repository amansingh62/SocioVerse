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
  const dropdownRef = useRef<HTMLDivElement>(null);
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
        `/user/search?q=${encodeURIComponent(value)}`,
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
    setFocused(false);
    router.push(`/dashboard/profile/${user.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = query ? users : recent;
    if (!list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => (p + 1) % list.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => (p <= 0 ? list.length - 1 : p - 1));
    }
    if (e.key === "Enter" && selectedIndex >= 0)
      selectUser(list[selectedIndex]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      )
        setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "linear-gradient(180deg, #c63c8c 0%, #a62c74 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 2px 20px rgba(233,30,140,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: "60px",
          gridTemplateColumns: "1fr auto 1fr",
        }}
      >
        <div
          onClick={() => router.push("/dashboard")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Socioverse"
            width={110}
            height={110}
            style={{
              width: "110px",
              height: "110px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "360px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              borderRadius: "50px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.30)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
              placeholder="Search users…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "13.5px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#fff",
                fontWeight: 500,
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setUsers([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "14px",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {focused && (
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
              }}
            >
              {!query && recent.length > 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px 6px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      color: "#AAAABC",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span>Recent</span>
                    <button
                      onClick={() => setRecent([])}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#E91E8C",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
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
                <div
                  style={{
                    padding: "16px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#AAAABC",
                    textAlign: "center",
                  }}
                >
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          <button
            onClick={handleLogout}
            className="
    flex items-center gap-2 px-3.5 py-2.5 rounded-xl
    border border-white/60 text-white
    text-sm font-medium transition-all duration-200
    hover:bg-white hover:text-[#c63c8c]
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "10px 16px",
        cursor: "pointer",
        background: active ? "#FCE4F1" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLDivElement).style.background = "#FBE9F0";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.username}
          width={34}
          height={34}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            flexShrink: 0,
            background: "#E91E8C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {user.username[0].toUpperCase()}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#1C1C2E",
            lineHeight: 1,
          }}
        >
          {user.username}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            color: "#E91E8C",
            fontWeight: 500,
          }}
        >
          @{user.username.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
