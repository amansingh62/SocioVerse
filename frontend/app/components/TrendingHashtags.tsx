"use client";

import { useState } from "react";

interface Tag {
  tag: string;
  posts: number;
  views: number;
  trend: "up" | "hot" | "new";
}

const MOCK_TAGS: Tag[] = [
  { tag: "#Socioverse", posts: 12, views: 284, trend: "hot" },
  { tag: "#Solana",     posts: 38, views: 940, trend: "up"  },
  { tag: "#DeFi",       posts: 21, views: 576, trend: "up"  },
  { tag: "#NFTs",       posts: 9,  views: 132, trend: "new" },
  { tag: "#Web3",       posts: 15, views: 391, trend: "hot" },
];

const TREND_CONFIG = {
  hot: { label: "🔥", color: "rgba(249,115,22,0.85)" },
  up:  { label: "↑",  color: "rgba(52,211,153,0.85)" },
  new: { label: "✦",  color: "rgba(168,85,247,0.85)" },
};

export default function TrendingHashtags() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(16,9,28,0.65)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(139,92,246,0.13)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white" }}
        >
          #
        </span>
        <div>
          <p className="font-[Syne] text-[14px] font-bold text-violet-100 leading-none">Trending Hashtags</p>
          <p className="text-[11px] text-violet-500/70 mt-0.5">Explore what&apos;s hot right now</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(139,92,246,0.10)", margin: "0 16px" }} />

      {/* Tag list */}
      <div className="flex flex-col py-2">
        {MOCK_TAGS.map(({ tag, posts, views, trend }, i) => {
          const cfg = TREND_CONFIG[trend];
          const isHovered = hovered === tag;
          return (
            <button
              key={tag}
              onMouseEnter={() => setHovered(tag)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center justify-between px-4 py-2.5 w-full text-left transition-all duration-150 cursor-pointer"
              style={{
                background: isHovered ? "rgba(139,92,246,0.09)" : "transparent",
              }}
            >
              {/* Left */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] w-4 text-center text-violet-700 font-mono font-bold">{i + 1}</span>
                <span
                  className="text-[13px] font-semibold transition-colors duration-150"
                  style={{ color: isHovered ? "#c4b5fd" : "#a78bfa" }}
                >
                  {tag}
                </span>
              </div>
              {/* Right */}
              <div className="flex items-center gap-2">
                <span className="text-[10.5px]" style={{ color: "rgba(139,92,246,0.45)" }}>
                  {posts}p · 👁 {views}
                </span>
                <span
                  className="text-[11px] font-bold w-5 text-center"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <button
          className="w-full py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
          style={{
            border: "1px solid rgba(139,92,246,0.22)",
            color: "rgba(167,139,250,0.7)",
            background: "transparent",
            fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.09)";
            (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.7)";
          }}
        >
          Explore all hashtags →
        </button>
      </div>
    </div>
  );
}