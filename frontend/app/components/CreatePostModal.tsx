"use client";

import { useState, useRef } from "react";
import { usePostStore } from "@/app/store/postStore";
import { uploadToCloudinary } from "@/app/lib/uploadCloudinary";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";

const QUICK_EMOJIS = ["😊", "✨", "🌿", "🔥", "💫", "🙌"];

export default function CreatePostModal() {
const createPost = usePostStore((s) => s.createPost);
const user = useAuthStore((s) => s.user);

const [content, setContent] = useState("");
const [file, setFile] = useState<File | null>(null);
const [preview, setPreview] = useState<string | null>(null);
const [posting, setPosting] = useState(false);

const fileRef = useRef<HTMLInputElement>(null);

const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
const f = e.target.files?.[0] ?? null;
setFile(f);

if (f) {
  setPreview(URL.createObjectURL(f));
}

};

const removeMedia = () => {
setFile(null);
setPreview(null);

if (fileRef.current) {
  fileRef.current.value = "";
}

};

const insertEmoji = (emoji: string) => {
setContent((c) => c + emoji);
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
    content,
    mediaUrl,
    mediaType,
    author: {
      id: user.id,
      username: user.username,
      image: user.image ?? null,
    },
  });

  setContent("");
  setFile(null);
  setPreview(null);

  if (fileRef.current) {
    fileRef.current.value = "";
  }
} finally {
  setPosting(false);
}
};

return ( <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 post-card-hover">
  {/* Header */}
  <div className="flex items-center justify-between">
    <span className="font-display text-sm tracking-[0.08em] uppercase text-rose">
      New Post
    </span>
    <span className="text-rose/60 text-lg">✦</span>
  </div>

  {/* Textarea */}
  <textarea
    className="glass-input min-h-[88px]"
    placeholder="Share something beautiful…"
    value={content}
    onChange={(e) => setContent(e.target.value)}
    rows={3}
  />

  {/* Media preview */}
  {preview && (
    <div className="relative rounded-2xl overflow-hidden border border-[rgba(201,150,122,0.12)]">
      {file?.type.startsWith("video") ? (
        <video
          src={preview}
          className="w-full max-h-48 object-cover"
        />
      ) : (
        <Image
          src={preview}
          alt="preview"
          width={600}
          height={300}
          className="w-full max-h-48 object-cover"
        />
      )}

      <button
        onClick={removeMedia}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/60 text-white text-xs flex items-center justify-center hover:bg-ink/80 transition-colors"
      >
        ✕
      </button>
    </div>
  )}

  {/* Footer toolbar */}
  <div className="flex items-center justify-between gap-3 flex-wrap">

    <div className="flex items-center gap-2">

      {/* Upload */}
      <label
        className="
        flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted text-[13px]
        border border-[rgba(201,150,122,0.18)] cursor-pointer
        hover:bg-[rgba(201,150,122,0.06)]
        hover:text-rose-deep
        hover:border-[rgba(201,150,122,0.32)]
        transition-all duration-200
      "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-4 h-4"
        >
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

      {/* Emoji */}
      <div className="flex gap-1">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => insertEmoji(emoji)}
            className="
            w-8 h-8 rounded-[10px]
            border border-[rgba(201,150,122,0.14)]
            bg-[rgba(255,253,249,0.5)]
            hover:bg-[rgba(201,150,122,0.08)]
            hover:scale-110
            transition-all duration-150
            flex items-center justify-center
          "
          >
            {emoji}
          </button>
        ))}
      </div>

    </div>

    {/* Submit */}
    <button
      onClick={handleSubmit}
      disabled={posting}
      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {posting ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Posting…
        </span>
      ) : (
        "Post ✦"
      )}
    </button>

  </div>
</div>
);
}
