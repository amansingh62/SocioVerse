"use client";

import { useState } from "react";
import Link from "next/link";

interface Ad {
  id: number;
  badge: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  gradFrom: string;
  gradTo: string;
  emoji: string;
}

const ADS: Ad[] = [
  {
    id: 1,
    badge: "LAUNCH",
    title: "MoonPad Presale",
    desc: "Next 100x gem launching Friday. Early access now live for whitelist members.",
    cta: "Join Presale",
    href: "#",
    gradFrom: "#6d28d9",
    gradTo: "#a855f7",
    emoji: "🚀",
  },
  {
    id: 2,
    badge: "YIELD",
    title: "AlphaDAO Vaults",
    desc: "Earn up to 24% APY on your SOL holdings. Audited. Non-custodial.",
    cta: "Start Earning",
    href: "#",
    gradFrom: "#4f46e5",
    gradTo: "#7c3aed",
    emoji: "💎",
  },
  {
    id: 3,
    badge: "DEX",
    title: "NexusSwap",
    desc: "Zero-fee swaps on all major pairs. 10 000+ daily traders can't be wrong.",
    cta: "Trade Now",
    href: "#",
    gradFrom: "#7c3aed",
    gradTo: "#db2777",
    emoji: "⚡",
  },
];

export default function Advertisement() {
  const [current, setCurrent] = useState(0);
  const ad = ADS[current];

  const prev = () => setCurrent((c) => (c - 1 + ADS.length) % ADS.length);
  const next = () => setCurrent((c) => (c + 1) % ADS.length);

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
      {/* Section header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            📢
          </span>
          <div>
            <p className="font-[Syne] text-[14px] font-bold text-violet-100 leading-none">Advertisement</p>
            <p className="text-[11px] text-violet-500/70 mt-0.5">Sponsored content</p>
          </div>
        </div>
        {/* Carousel controls */}
        <div className="flex gap-1">
          {[prev, next].map((fn, i) => (
            <button
              key={i}
              onClick={fn}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all duration-150"
              style={{
                border: "1px solid rgba(139,92,246,0.22)",
                color: "rgba(167,139,250,0.6)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.6)";
              }}
            >
              {i === 0 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(139,92,246,0.10)", margin: "0 16px" }} />

      {/* Ad card */}
      <div className="p-4">
        <div
          className="rounded-xl p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${ad.gradFrom}22, ${ad.gradTo}14)`,
            border: `1px solid ${ad.gradFrom}44`,
          }}
        >
          {/* AD badge */}
          <span
            className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(10,5,20,0.55)",
              color: "rgba(139,92,246,0.55)",
              border: "1px solid rgba(139,92,246,0.2)",
              letterSpacing: "0.05em",
            }}
          >
            AD
          </span>

          {/* Sponsor badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mb-2"
            style={{
              background: `${ad.gradFrom}33`,
              color: "#c4b5fd",
              border: `1px solid ${ad.gradFrom}55`,
              letterSpacing: "0.08em",
            }}
          >
            {ad.badge}
          </span>

          <div className="flex items-start gap-2.5 mb-2.5">
            <span className="text-2xl leading-none mt-0.5">{ad.emoji}</span>
            <div>
              <p className="font-[Syne] text-[14px] font-bold text-violet-100 leading-tight">{ad.title}</p>
              <p className="text-[12px] text-violet-300/70 leading-relaxed mt-1">{ad.desc}</p>
            </div>
          </div>

          <Link
            href={ad.href}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all duration-200 hover:opacity-85 hover:-translate-y-px"
            style={{
              background: `linear-gradient(135deg, ${ad.gradFrom}, ${ad.gradTo})`,
              textDecoration: "none",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {ad.cta}
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width:  i === current ? 16 : 6,
                height: 6,
                background: i === current
                  ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                  : "rgba(139,92,246,0.22)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* Advertise CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/dashboard/advertise"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 hover:bg-violet-950/40"
          style={{
            border: "1px dashed rgba(139,92,246,0.28)",
            color: "rgba(167,139,250,0.6)",
            textDecoration: "none",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Advertise Here
        </Link>
      </div>
    </div>
  );
}