"use client";

import Image from "next/image";
import Link from "next/link";

interface Profile {
  id: string;
  username: string;
  handle: string;
  followers: number;
  image: string | null;
  gradient: string;
  verified: boolean;
}

const MOCK_PROFILES: Profile[] = [
  { id: "1", username: "SolDart",    handle: "@SolDart_io",  followers: 6, image: null, gradient: "135deg,#7c3aed,#a855f7", verified: true  },
  { id: "2", username: "fabiona",    handle: "@fabiona_",    followers: 5, image: null, gradient: "135deg,#4f46e5,#ec4899", verified: false },
  { id: "3", username: "0xSweep",    handle: "@0xSweep",     followers: 3, image: null, gradient: "135deg,#6d28d9,#db2777", verified: false },
  { id: "4", username: "web3Jay",    handle: "@web3Jay_dev", followers: 2, image: null, gradient: "135deg,#a855f7,#f472b6", verified: true  },
  { id: "5", username: "imperoNFT",  handle: "@imperoNFT",   followers: 2, image: null, gradient: "135deg,#7c3aed,#6366f1", verified: false },
];

export default function FeaturedProfiles() {
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
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            ⭐
          </span>
          <div>
            <p className="font-[Syne] text-[14px] font-bold text-violet-100 leading-none">Featured Profiles</p>
            <p className="text-[11px] text-violet-500/70 mt-0.5">Top creators this week</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(139,92,246,0.10)", margin: "0 16px" }} />

      {/* Profile list */}
      <div className="flex flex-col py-2">
        {MOCK_PROFILES.map((profile, i) => (
          <Link
            key={profile.id}
            href={`/dashboard/profile/${profile.id}`}
            className="flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,92,246,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            {/* Rank */}
            <span
              className="text-[11px] font-bold w-4 text-center flex-shrink-0"
              style={{ color: i < 3 ? "#a78bfa" : "rgba(139,92,246,0.35)" }}
            >
              {i + 1}
            </span>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[14px]"
              style={{
                background: `linear-gradient(${profile.gradient})`,
                border: "2px solid rgba(139,92,246,0.30)",
                boxShadow: "0 2px 10px rgba(124,58,237,0.20)",
              }}
            >
              {profile.image ? (
                <Image
                  src={profile.image}
                  width={36}
                  height={36}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>

            {/* Name & handle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p
                  className="text-[13px] font-semibold truncate leading-none transition-colors duration-150"
                  style={{ color: "rgba(237,233,254,0.9)" }}
                >
                  {profile.username}
                </p>
                {profile.verified && (
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2 h-2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-violet-500/60 mt-0.5 truncate">{profile.followers} followers</p>
            </div>

            {/* Follow button */}
            <button
              onClick={(e) => e.preventDefault()}
              className="flex-shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200"
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#a78bfa",
                fontFamily: "DM Sans, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#7c3aed,#a855f7)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.25)";
              }}
            >
              Follow
            </button>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-1">
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
          Discover more creators →
        </button>
      </div>
    </div>
  );
}