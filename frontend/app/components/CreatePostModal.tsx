"use client";

import { useState, useRef } from "react";
import { usePostStore } from "@/app/store/postStore";
import { uploadToCloudinary } from "@/app/lib/uploadCloudinary";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";

const C = {
  accent:     "#E91E8C",
  accentPale: "#FCE4F1",
  pageBg:     "#FBE9F0",
  card:       "#FFFFFF",
  border:     "#F3D0E3",
  ink:        "#1C1C2E",
  inkMid:     "#555566",
  inkMuted:   "#AAAABC",
  font:       "'DM Sans', sans-serif",
};

export default function CreatePostModal() {
  const createPost = usePostStore((s) => s.createPost);
  const user = useAuthStore((s) => s.user);

  const [content, setContent] = useState("");
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

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
        mediaUrl = await uploadToCloudinary(file);
        mediaType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";
      }
      await createPost({
        content, mediaUrl, mediaType,
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

  const charCount = content.length;
  const charLimit = 1000;
  const overLimit = charCount > charLimit;
  const canPost   = (content.trim() || file) && !overLimit && !posting;

  return (
    <div style={{
      background:   C.card,
      borderRadius: "20px",
      border:       `1px solid ${C.border}`,
      boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
      overflow:     "hidden",
    }}>

      {/* ── Avatar + Textarea row ── */}
      <div style={{ display:"flex", gap:"13px", padding:"20px 22px 14px" }}>
       

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          style={{
            flex:       1,
            background: "transparent",
            border:     "none",
            outline:    "none",
            resize:     "none",
            fontSize:   "14.5px",
            lineHeight: "1.75",
            fontFamily: C.font,
            color:      C.inkMid,
            caretColor: C.accent,
            paddingTop: "8px",
          }}
        />
      </div>

      {/* ── Media preview ── */}
      {preview && (
        <div style={{ margin:"0 22px 14px", borderRadius:"14px", overflow:"hidden", position:"relative", border:`1px solid ${C.border}` }}>
          {file?.type.startsWith("video") ? (
            <video src={preview} style={{ width:"100%", maxHeight:"200px", objectFit:"cover", display:"block" }} />
          ) : (
            <Image src={preview} alt="preview" width={600} height={300}
              style={{ width:"100%", maxHeight:"200px", objectFit:"cover", display:"block" }} />
          )}
          <button onClick={removeMedia} style={{
            position:"absolute", top:"10px", right:"10px",
            width:"26px", height:"26px", borderRadius:"50%",
            background:C.accent, border:"none", color:"#fff",
            cursor:"pointer", fontSize:"12px",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
          }}>✕</button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 22px 16px",
        borderTop:`1px solid ${C.border}`,
      }}>

        {/* Media */}
        <label style={{
          display:"flex", alignItems:"center", gap:"7px",
          cursor:"pointer", fontFamily:C.font, fontSize:"13px",
          fontWeight:600, color:C.inkMuted,
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          Media
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display:"none" }} />
        </label>

        {/* Char count + Post */}
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{
            fontFamily:C.font, fontSize:"12px", fontWeight:600,
            color: overLimit ? "#EF4444" : charCount > 800 ? "#F59E0B" : C.inkMuted,
          }}>
            {charCount}/{charLimit}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canPost}
            style={{
              padding:"8px 24px", borderRadius:"50px", border:"none",
              background: canPost ? C.accent : C.accentPale,
              color:      canPost ? "#fff"   : C.accent,
              fontSize:"13px", fontWeight:700, fontFamily:C.font,
              cursor: canPost ? "pointer" : "not-allowed",
              letterSpacing:"0.02em",
              boxShadow: canPost ? "0 4px 30px rgba(0,0,0,0.1)": "none",
              transition:"background 0.2s, box-shadow 0.2s",
            }}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}