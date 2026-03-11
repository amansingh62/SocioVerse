"use client";

import { useState, useRef } from "react";
import { usePostStore } from "@/app/store/postStore";
import { uploadToCloudinary } from "@/app/lib/uploadCloudinary";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";

export default function CreatePostModal() {
  const createPost = usePostStore((s) => s.createPost);
  const user = useAuthStore((s) => s.user);

  const [content, setContent]   = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [posting, setPosting]   = useState(false);
  const [focused, setFocused]   = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const removeMedia = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) return;
    if (!user) return;
    setPosting(true);
    let mediaUrl: string | null = null;
    let mediaType: "IMAGE" | "VIDEO" | null = null;
    try {
      if (file) {
        mediaUrl  = await uploadToCloudinary(file);
        mediaType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";
      }
      await createPost({
        content,
        mediaUrl,
        mediaType,
        author: { id: user.id, username: user.username, image: user.image ?? null },
      });
      setContent("");
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setPosting(false);
    }
  };

  const charCount  = content.length;
  const charLimit  = 1000;
  const overLimit  = charCount > charLimit;
  const canPost    = (content.trim() || file) && !overLimit && !posting;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: focused ? "rgba(22,12,40,0.85)" : "rgba(16,9,28,0.65)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: focused
          ? "1px solid rgba(139,92,246,0.38)"
          : "1px solid rgba(139,92,246,0.14)",
        boxShadow: focused
          ? "0 0 0 3px rgba(124,58,237,0.08), 0 12px 40px rgba(8,5,15,0.35)"
          : "none",
      }}
    >
      {/* ── Top row: avatar + textarea ── */}
      <div className="flex gap-3 p-4 pb-3">
        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Write your Post"
          rows={3}
          className="flex-1 bg-transparent outline-none resize-none text-[14px] leading-relaxed placeholder:transition-colors"
          style={{
            color: "#ede9fe",
            fontFamily: "DM Sans, sans-serif",
            caretColor: "#a855f7",
          }}
        />
      </div>

      {/* ── Media preview ── */}
      {preview && (
        <div
          className="mx-4 mb-3 rounded-xl overflow-hidden relative"
          style={{ border: "1px solid rgba(139,92,246,0.18)" }}
        >
          {file?.type.startsWith("video") ? (
            <video src={preview} className="w-full max-h-52 object-cover" />
          ) : (
            <Image
              src={preview}
              alt="preview"
              width={600}
              height={300}
              className="w-full max-h-52 object-cover block"
            />
          )}
          <button
            onClick={removeMedia}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs text-white transition-all duration-150"
            style={{ background: "rgba(8,5,15,0.72)", border: "1px solid rgba(139,92,246,0.30)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.65)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(8,5,15,0.72)"; }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "rgba(139,92,246,0.10)", margin: "0 16px" }} />

      {/* ── Toolbar row ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">

        {/* Left: media tools */}
        <div className="flex items-center gap-1.5">

          {/* Image/Video upload */}
          <label
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium cursor-pointer transition-all duration-200"
            style={{
              border: "1px solid rgba(139,92,246,0.18)",
              color: "rgba(167,139,250,0.75)",
              fontFamily: "DM Sans, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLabelElement).style.background = "rgba(139,92,246,0.10)";
              (e.currentTarget as HTMLLabelElement).style.color = "#c4b5fd";
              (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(139,92,246,0.32)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLabelElement).style.background = "transparent";
              (e.currentTarget as HTMLLabelElement).style.color = "rgba(167,139,250,0.75)";
              (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(139,92,246,0.18)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            Media
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Right: char count + submit */}
        <div className="flex items-center gap-3">
          {/* Char count */}
          <span
            className="text-[11.5px] font-mono tabular-nums"
            style={{ color: overLimit ? "#f87171" : charCount > 800 ? "#fbbf24" : "rgba(139,92,246,0.40)" }}
          >
            {charCount}/{charLimit}
          </span>

          {/* Dart button */}
          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className="relative px-5 py-2 rounded-xl text-[13.5px] font-bold text-white transition-all duration-200 overflow-hidden"
            style={{
              background: canPost
                ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                : "rgba(139,92,246,0.18)",
              border: canPost
                ? "1px solid rgba(168,85,247,0.50)"
                : "1px solid rgba(139,92,246,0.15)",
              color: canPost ? "white" : "rgba(139,92,246,0.40)",
              cursor: canPost ? "pointer" : "not-allowed",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: canPost ? "0 4px 18px rgba(124,58,237,0.35)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!canPost) return;
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#6d28d9,#9333ea)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(124,58,237,0.50)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!canPost) return;
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#7c3aed,#a855f7)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(124,58,237,0.35)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {posting ? (
              <span className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
                />
                Posting…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Post
                <span className="text-violet-200">◆</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
