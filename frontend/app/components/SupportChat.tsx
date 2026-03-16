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
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
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
        background: "rgba(248, 220, 234, 0.86)",
        border: "1px solid rgba(248,220,234,0.3)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 cursor-pointer"
      >
        <span
          className="relative flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ background: "#E056A4" }}
        >
          💬
        </span>

        <div className="text-left flex-1">
          <p className="text-[13px] font-semibold text-black leading-none">
            Support Chat
          </p>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Ask SocioAI for help
          </p>
        </div>

        <span
          className="text-gray-600 text-xs transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Messages */}
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
                          background: "#ffffff",
                          color: "#333",
                          borderRadius: "4px 14px 14px 14px",
                        }
                      : {
                          background: "#E056A4",
                          color: "white",
                          borderRadius: "14px 14px 4px 14px",
                        }
                  }
                >
                  {m.text}
                </div>

                <span className="text-[9.5px] text-gray-600 px-1">
                  {m.time}
                </span>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-pink-200">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message…"
              className="flex-1 rounded-lg px-3 py-2 text-[12px] outline-none"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(224,86,164,0.3)",
                color: "#333",
              }}
            />

            <button
              onClick={send}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-80"
              style={{ background: "#E056A4" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}