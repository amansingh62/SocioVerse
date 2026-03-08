"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">

      {/* Blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      <div className="w-full max-w-[400px] relative z-10 flex flex-col gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#c9967a] text-3xl">✦</span>
          <h1 className="font-display text-[36px] font-semibold text-[#1c1917] tracking-wide leading-none">
            Socioverse
          </h1>
          <p className="text-[13px] text-[#a08070]">Welcome back</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 flex flex-col gap-5">

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-medium text-[#a08070] tracking-wider uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="glass-input"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11.5px] font-medium text-[#a08070] tracking-wider uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="glass-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0a090] hover:text-[#a08070] transition-colors"
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12.5px] text-[#c05040] bg-[rgba(201,80,64,0.06)] border border-[rgba(201,80,64,0.15)] rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In ✦"
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-[#a08070]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#a0614a] font-medium hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}