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
    emoji: "🚀",
  },
  {
    id: 2,
    badge: "YIELD",
    title: "AlphaDAO Vaults",
    desc: "Earn up to 24% APY on your SOL holdings. Audited. Non-custodial.",
    cta: "Start Earning",
    href: "#",
    emoji: "💎",
  },
  {
    id: 3,
    badge: "DEX",
    title: "NexusSwap",
    desc: "Zero-fee swaps on all major pairs. 10 000+ daily traders can't be wrong.",
    cta: "Trade Now",
    href: "#",
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
        background: "rgba(248,220,234,0.86)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(248,220,234,0.3)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px]"
            style={{ background: "#E056A4", color: "white" }}
          >
            📢
          </span>

          <div>
            <p className="font-[Syne] text-[14px] font-bold text-black leading-none">
              Advertisement
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Sponsored content
            </p>
          </div>
        </div>

        {/* Carousel arrows */}
        <div className="flex gap-1">
          {[prev, next].map((fn, i) => (
            <button
              key={i}
              onClick={fn}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition"
              style={{
                border: "1px solid rgba(224,86,164,0.4)",
                color: "#E056A4",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E056A4";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#E056A4";
              }}
            >
              {i === 0 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(224,86,164,0.25)",
          margin: "0 16px",
        }}
      />

      {/* Ad card */}
      <div className="p-4">
        <div
          className="rounded-xl p-4 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(224,86,164,0.3)",
          }}
        >
          {/* AD badge */}
          <span
            className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: "#E056A4",
              color: "white",
              letterSpacing: "0.05em",
            }}
          >
            AD
          </span>

          {/* Sponsor badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mb-2"
            style={{
              background: "rgba(224,86,164,0.15)",
              color: "#E056A4",
              border: "1px solid rgba(224,86,164,0.35)",
              letterSpacing: "0.08em",
            }}
          >
            {ad.badge}
          </span>

          <div className="flex items-start gap-2.5 mb-2.5">
            <span className="text-2xl">{ad.emoji}</span>

            <div>
              <p className="font-[Syne] text-[14px] font-bold text-black">
                {ad.title}
              </p>

              <p className="text-[12px] text-gray-700 mt-1 leading-relaxed">
                {ad.desc}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={ad.href}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white transition hover:opacity-85"
            style={{
              background: "#E056A4",
              textDecoration: "none",
            }}
          >
            {ad.cta}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              className="w-3 h-3"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                background: i === current ? "#E056A4" : "rgba(224,86,164,0.3)",
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
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold transition"
          style={{
            border: "1px dashed rgba(224,86,164,0.4)",
            color: "#E056A4",
            textDecoration: "none",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="w-3.5 h-3.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Advertise Here
        </Link>
      </div>
    </div>
  );
}