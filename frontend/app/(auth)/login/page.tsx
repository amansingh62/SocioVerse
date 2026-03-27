"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    className="min-h-screen relative overflow-hidden"
    style={{
      background: "linear-gradient(135deg,#c63c8c,#7a1c5a)",
    }}
  >

    {/* 🌸 Top Left Logo */}
    <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
      <Image src="/login.logo.png" alt="Logo" width={120} height={120} />
    </div>

    {/* Glow blobs */}
    <div className="absolute w-[500px] h-[500px] bg-[#ff7bbd]/30 blur-[140px] rounded-full top-[-150px] left-[-120px]" />
    <div className="absolute w-[500px] h-[500px] bg-[#ff4fa3]/20 blur-[140px] rounded-full bottom-[-150px] right-[-120px]" />

    {/* Center Container */}
    <div className="flex items-center justify-center min-h-screen p-5">

      <div className="w-full max-w-[420px] flex flex-col gap-8 z-10">

        {/* Welcome text */}
        <div className="text-center">
          <h1 className="text-[34px] font-semibold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-pink-200 text-sm mt-1">
            Continue your Socioverse journey
          </p>
        </div>

        {/* 💎 DARK PINK GLASS CARD */}
        <div
          className="rounded-[28px] p-8 flex flex-col gap-5"
          style={{
            background: "rgba(198,60,140,0.25)", // 🔥 darker pink
            backdropFilter: "blur(35px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 25px 80px rgba(198,60,140,0.45)",
          }}
        >

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-pink-200 uppercase">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="px-4 py-3 rounded-xl outline-none text-white text-sm transition"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid #ff7bbd")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.2)")
                }
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-pink-200 uppercase">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="px-4 py-3 rounded-xl outline-none text-white text-sm w-full pr-10"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-white bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            {/* 🔥 BUTTON */}
            <button
  type="submit"
  disabled={loading}
  className="
    w-full py-3 rounded-xl text-sm font-medium
    text-white
    transition-all duration-200
    border border-white

    bg-gradient-to-r from-[#ff4fa3] to-[#c63c8c]

    hover:bg-white hover:text-[#c63c8c]
    hover:bg-none

    active:scale-[0.97]
  "
  style={{
    boxShadow: "0 10px 35px rgba(255,79,163,0.5)",
  }}
>
  {loading ? "Signing in…" : "Enter Socioverse ✦"}
</button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-pink-200">
          Don’t have an account?{" "}
          <Link href="/register" className="text-white font-medium hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  </div>
);
}