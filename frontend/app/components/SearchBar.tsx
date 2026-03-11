"use client";

import { useState, useRef } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header
      className="top-0 z-50 w-full"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,5,15,0.97) 0%, rgba(10,6,18,0.92) 100%)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderBottom: "1px solid rgba(139,92,246,0.14)",
        boxShadow: "0 4px 32px rgba(8,5,15,0.55)",
      }}
    >
      <div className="flex items-center justify-center px-8 py-3">

        {/* Search container */}
        <div className="w-full max-w-xl relative">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
            style={{
              background: focused
                ? "rgba(22,12,40,0.90)"
                : "rgba(16,9,28,0.70)",
              border: focused
                ? "1px solid rgba(139,92,246,0.42)"
                : "1px solid rgba(139,92,246,0.16)",
              boxShadow: focused
                ? "0 0 0 3px rgba(124,58,237,0.12), 0 8px 32px rgba(8,5,15,0.4)"
                : "none",
            }}
          >
            {/* Search icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
              style={{ color: focused ? "#a78bfa" : "rgba(139,92,246,0.40)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search users, hashtags, addresses…"
              className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:transition-colors"
              style={{
                color: "#ede9fe",
                fontFamily: "DM Sans, sans-serif",
                caretColor: "#a855f7",
              }}
            />

            {/* Clear button */}
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
                style={{
                  background: "rgba(139,92,246,0.18)",
                  color: "#a78bfa",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-3 h-3"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}