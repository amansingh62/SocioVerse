"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">

      {/* Ambient blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      {/* Extra decorative blob */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 400, height: 400, borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(143,166,138,0.09) 0%, transparent 70%)",
          top: "40%", left: "55%",
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[#c9967a] text-xl">✦</span>
          <span className="font-display text-[22px] font-semibold tracking-widest text-[#1c1917]">
            Socioverse
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 rounded-xl text-sm font-medium text-[#a0614a] border border-[rgba(201,150,122,0.28)] bg-[rgba(201,150,122,0.06)] hover:bg-[rgba(201,150,122,0.12)] transition-all duration-200"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/register")}
            className="btn-primary px-5 py-2 text-sm"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-10 pb-24 gap-8">

        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(201,150,122,0.25)] bg-[rgba(201,150,122,0.07)] text-[12px] text-[#a0614a] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9967a] animate-pulse" />
          Beautiful. Personal. Yours.
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-3 max-w-3xl">
          <h1 className="font-display text-[64px] md:text-[80px] font-light text-[#1c1917] leading-[1.05] tracking-tight">
            A space to share
            <br />
            <span
              className="font-semibold"
              style={{
                background: "linear-gradient(135deg, #c9967a 0%, #a0614a 60%, #c9967a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              what matters.
            </span>
          </h1>
          <p className="text-[16px] text-[#7a6a60] leading-relaxed max-w-lg">
            Socioverse is a refined social experience — post, connect, and
            discover moments that move you, beautifully.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => router.push("/register")}
            className="btn-primary px-8 py-3 text-[15px] flex items-center gap-2"
          >
            Create your account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 rounded-xl text-[15px] font-medium text-[#5a4a40] border border-[rgba(201,150,122,0.22)] bg-[rgba(255,253,249,0.6)] hover:bg-[rgba(201,150,122,0.06)] transition-all duration-200"
          >
            Sign in
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#a08070]">
          <div className="flex -space-x-2">
            {["#e8c4a0", "#c9967a", "#a0614a", "#d4b090", "#b87a5a"].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: `linear-gradient(135deg, ${c}, #a0614a)` }}
              >
                {["A", "M", "J", "S", "R"][i]}
              </div>
            ))}
          </div>
          <span>Join <strong className="text-[#5a4a40]">2,400+</strong> people already sharing</span>
        </div>

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-6">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              ),
              title: "Rich posts",
              desc: "Share photos, videos, and stories with a beautiful editor.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: "Real connections",
              desc: "Follow people you admire and build a community around you.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              title: "Thoughtful replies",
              desc: "Nested comments, replies, and reactions — all in one thread.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-5 text-left flex flex-col gap-3 post-card-hover"
            >
              <div className="w-9 h-9 rounded-xl bg-[rgba(201,150,122,0.12)] border border-[rgba(201,150,122,0.20)] flex items-center justify-center text-[#c9967a]">
                {icon}
              </div>
              <div>
                <p className="font-display text-[15px] font-semibold text-[#1c1917] mb-1">{title}</p>
                <p className="text-[12.5px] text-[#7a6a60] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-6 text-[12px] text-[#b0a090] border-t border-[rgba(201,150,122,0.10)]">
        <span className="text-[#c9967a] mr-1">✦</span>
        Socioverse · Made with care · {new Date().getFullYear()}
      </footer>
    </div>
  );
}