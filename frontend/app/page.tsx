"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg,#c63c8c,#7a1c5a)",
      }}
    >

      <div className="absolute w-[500px] h-[500px] bg-[#ff7bbd]/30 blur-[140px] rounded-full top-[-150px] left-[-120px]" />
      <div className="absolute w-[500px] h-[500px] bg-[#ff4fa3]/20 blur-[140px] rounded-full bottom-[-150px] right-[-120px]" />

      <nav className="relative z-10 flex items-center justify-between px-10 py-6">

        <div className="flex items-center gap-2">
          <Image
            src="/login.logo.png"
            alt="Socioverse"
            width={130}
            height={130}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="
              px-5 py-2 rounded-xl text-sm font-medium
              text-white border border-white/40
              bg-white/10 backdrop-blur
              hover:bg-white hover:text-[#c63c8c]
              transition-all
            "
          >
            Sign in
          </button>

          <button
            onClick={() => router.push("/register")}
            className="
              px-5 py-2 rounded-xl text-sm font-medium
              text-white border border-white
              bg-gradient-to-r from-[#ff4fa3] to-[#c63c8c]
              hover:bg-white hover:text-[#c63c8c]
              transition-all
            "
          >
            Get started
          </button>
        </div>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-[12px] text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Beautiful. Personal. Yours.
        </div>

        <div className="flex flex-col items-center gap-4 max-w-3xl">
          <h1 className="text-[64px] md:text-[80px] font-light text-white leading-[1.05] tracking-tight">
            A space to share
            <br />
            <span
              className="font-semibold"
              style={{
                background: "linear-gradient(135deg,#fff,#ffd1ec,#fff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              what matters.
            </span>
          </h1>

          <p className="text-[16px] text-pink-200 max-w-lg">
            Socioverse is a refined social experience — post, connect, and
            discover moments that move you beautifully.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => router.push("/register")}
            className="
              px-8 py-3 rounded-xl text-[15px] font-medium
              text-white border border-white
              bg-gradient-to-r from-[#ff4fa3] to-[#c63c8c]
              hover:bg-white hover:text-[#c63c8c]
              transition-all
            "
          >
            Create your account ✦
          </button>

          <button
            onClick={() => router.push("/login")}
            className="
              px-8 py-3 rounded-xl text-[15px]
              text-white border border-white/40
              bg-white/10
              hover:bg-white hover:text-[#c63c8c]
              transition-all
            "
          >
            Sign in
          </button>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-pink-200">
          <div className="flex -space-x-2">
            {["A", "M", "J", "S", "R"].map((l, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-[#c63c8c] flex items-center justify-center text-white text-[10px] font-bold bg-[#ff4fa3]"
              >
                {l}
              </div>
            ))}
          </div>
          <span>
            Join <strong className="text-white">2,400+</strong> people
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-6">
          {[
            { title: "Rich posts", desc: "Photos, videos, stories." },
            { title: "Real connections", desc: "Follow & grow." },
            { title: "Thoughtful replies", desc: "Deep conversations." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 text-left flex flex-col gap-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                ✦
              </div>

              <div>
                <p className="text-[15px] font-semibold text-white mb-1">
                  {f.title}
                </p>
                <p className="text-[12.5px] text-pink-200">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </section>

      <footer className="relative z-10 text-center py-6 text-[12px] text-pink-200 border-t border-white/10">
        ✦ Socioverse · Made with ❤️ · {new Date().getFullYear()}
      </footer>
    </div>
  );
}