"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "bot" | "user";
  text: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SupportChat() {
  const [open, setOpen]       = useState(true);
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm SocioAI. What can I help you with?", time: now() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed, time: now() }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Thanks for reaching out! Our team will get back to you shortly. 💜", time: now() },
      ]);
    }, 800);
  };

  return (
    <div
      className="h-72 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        background: "linear-gradient(135deg, rgba(109,40,217,0.22), rgba(139,92,246,0.10))",
        border: "1px solid rgba(139,92,246,0.28)",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 cursor-pointer"
      >
        {/* Pulsing dot */}
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
        >
          <span className="text-[13px]">💬</span>
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
          />
        </span>
        <div className="text-left flex-1">
          <p className="text-[13px] font-semibold text-violet-200 leading-none">Support Chat</p>
          <p className="text-[11px] text-violet-400/60 mt-0.5">Ask SocioAI for help</p>
        </div>
        <span
          className="text-violet-400/50 text-xs transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
  <>
    {/* Message list */}
    <div className="flex flex-col gap-2 px-3 pb-2 flex-1 overflow-y-auto no-scrollbar">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex flex-col gap-0.5 ${
            m.role === "user" ? "items-end" : "items-start"
          }`}
        >
          <div
            className="px-3 py-2 rounded-xl text-[12px] leading-relaxed max-w-[90%]"
            style={
              m.role === "bot"
                ? {
                    background: "rgba(10,5,20,0.55)",
                    color: "rgba(196,181,253,0.9)",
                    borderRadius: "4px 14px 14px 14px",
                  }
                : {
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "white",
                    borderRadius: "14px 14px 4px 14px",
                  }
            }
          >
            {m.text}
          </div>
          <span className="text-[9.5px] text-violet-800 px-1">{m.time}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>

    {/* Input row */}
    <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-violet-900/30">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Type your message…"
        className="flex-1 rounded-lg px-3 py-2 text-[12px] outline-none transition-all duration-200"
        style={{
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.22)",
          color: "#ede9fe",
          fontFamily: "DM Sans, sans-serif",
        }}
      />

      <button
        onClick={send}
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  </>
)}
    </div>
  );
}