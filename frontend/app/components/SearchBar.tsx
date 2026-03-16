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
        background: "linear-gradient(180deg, #c63c8c 0%, #a62c74 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center justify-center px-8 py-2">

        {/* Search container */}
        <div className="w-full max-w-xl relative">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
            style={{
              background: focused
                ? "rgba(255,255,255,0.18)"
                : "rgba(255,255,255,0.10)",
              border: focused
                ? "1px solid rgba(255,255,255,0.55)"
                : "1px solid rgba(255,255,255,0.25)",
              boxShadow: focused
                ? "0 0 0 3px rgba(255,255,255,0.18)"
                : "none",
            }}
          >

            {/* Search icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              className="w-4 h-4 flex-shrink-0 transition-opacity"
              style={{ opacity: focused ? 1 : 0.65 }}
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
              className="flex-1 bg-transparent outline-none text-[13.5px]"
              style={{
                color: "white",
                fontFamily: "DM Sans, sans-serif",
                caretColor: "white",
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
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
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