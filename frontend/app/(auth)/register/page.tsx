"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");
        const { data } = await api.get("/auth/check-username", {
          params: { username },
          signal: controller.signal,
        });
        setUsernameStatus(data.available ? "available" : "taken");
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "CanceledError" && err.name !== "AbortError") {
          setUsernameStatus("idle");
        }
      }
    }, 500);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [username]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === "taken") { setError("That username is already taken."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, username, email, password });
      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #ff7bbd";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#c63c8c,#7a1c5a)" }}
    >
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20 flex items-center gap-2">
        <Image src="/login.logo.png" alt="Logo" width={120} height={120} className="w-[90px] sm:w-[120px]" />
      </div>

      <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#ff7bbd]/30 blur-[100px] sm:blur-[140px] rounded-full top-[-100px] sm:top-[-150px] left-[-80px] sm:left-[-120px]" />
      <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#ff4fa3]/20 blur-[100px] sm:blur-[140px] rounded-full bottom-[-100px] sm:bottom-[-150px] right-[-80px] sm:right-[-120px]" />

      <div className="flex items-center justify-center min-h-screen p-4 sm:p-5 pt-20 sm:pt-5">
        <div className="w-full max-w-[420px] flex flex-col gap-6 sm:gap-8 z-10">

          <div className="text-center">
            <h1 className="text-[28px] sm:text-[34px] font-semibold text-white tracking-tight">
              Join Socioverse
            </h1>
            <p className="text-pink-200 text-[13px] sm:text-sm mt-1">
              Start your Socioverse journey today
            </p>
          </div>

          <div
            className="rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 flex flex-col gap-5"
            style={{
              background: "rgba(198,60,140,0.25)",
              backdropFilter: "blur(35px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 25px 80px rgba(198,60,140,0.45)",
            }}
          >
            <form onSubmit={handleRegister} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-pink-200 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="px-4 py-2.5 sm:py-3 rounded-xl outline-none text-white text-[13px] sm:text-sm transition"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-pink-200 uppercase">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-[13px] sm:text-sm select-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="yourname"
                    required
                    className="px-4 py-2.5 sm:py-3 pl-8 pr-10 rounded-xl outline-none text-white text-[13px] sm:text-sm w-full transition"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm">
                    {usernameStatus === "checking" && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    )}
                    {usernameStatus === "available" && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" className="w-4 h-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {usernameStatus === "taken" && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" className="w-4 h-4">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </span>
                </div>
                {usernameStatus === "available" && (
                  <p className="text-[11.5px] text-green-300 flex items-center gap-1">
                    <span>✓</span> Username is available
                  </p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-[11.5px] text-red-300 flex items-center gap-1">
                    <span>✕</span> Username already taken
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-pink-200 uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="px-4 py-2.5 sm:py-3 rounded-xl outline-none text-white text-[13px] sm:text-sm transition"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-pink-200 uppercase">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="px-4 py-2.5 sm:py-3 rounded-xl outline-none text-white text-[13px] sm:text-sm w-full pr-10"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
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

              {error && (
                <p className="text-[12px] text-white bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || usernameStatus === "taken"}
                className="w-full py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-sm font-medium text-white transition-all duration-200 border border-white bg-gradient-to-r from-[#ff4fa3] to-[#c63c8c] hover:bg-white hover:text-[#c63c8c] hover:bg-none active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ boxShadow: "0 10px 35px rgba(255,79,163,0.5)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account ✦"
                )}
              </button>

            </form>
          </div>

          <p className="text-center text-[12px] sm:text-[13px] text-pink-200">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}