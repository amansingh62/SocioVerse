"use client";

import { useState, useRef } from "react";
import { usePostStore } from "@/app/store/postStore";
import { uploadToCloudinary } from "@/app/lib/uploadCloudinary";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";

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
  const canPost = (content.trim() || file) && !overLimit && !posting;

  const charCountColor = overLimit
    ? "text-red-500"
    : charCount > 800
    ? "text-amber-500"
    : "text-[#AAAABC]";

  return (
    <div className="bg-white rounded-[20px] border border-[#F3D0E3] shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">

      <div className="flex gap-[13px] px-[22px] pt-5 pb-[14px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="flex-1 bg-transparent border-none outline-none resize-none text-[14.5px] leading-[1.75] font-[DM_Sans,sans-serif] text-[#555566] caret-[#E91E8C] pt-2 placeholder:text-[#AAAABC]"
        />
      </div>

      {preview && (
        <div className="mx-[22px] mb-[14px] rounded-[14px] overflow-hidden relative border border-[#F3D0E3]">
          {file?.type.startsWith("video") ? (
            <video
              src={preview}
              className="w-full max-h-[200px] object-cover block"
            />
          ) : (
            <Image
              src={preview}
              alt="preview"
              width={600}
              height={300}
              className="w-full max-h-[200px] object-cover block"
            />
          )}
          <button
            onClick={removeMedia}
            className="absolute top-[10px] right-[10px] w-[26px] h-[26px] rounded-full bg-[#E91E8C] border-none text-white cursor-pointer text-[12px] flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-[22px] pt-[10px] pb-4 border-t border-[#F3D0E3]">

        <label className="flex items-center gap-[7px] cursor-pointer font-[DM_Sans,sans-serif] text-[13px] font-semibold text-[#AAAABC]">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#E91E8C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
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

        <div className="flex items-center gap-[14px]">
          <span className={`font-[DM_Sans,sans-serif] text-[12px] font-semibold ${charCountColor}`}>
            {charCount}/{charLimit}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className={`px-6 py-2 rounded-full border-none text-[13px] font-bold font-[DM_Sans,sans-serif] tracking-[0.02em] transition-[background,box-shadow] duration-200
              ${canPost
                ? "bg-[#E91E8C] text-white cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                : "bg-[#FCE4F1] text-[#E91E8C] cursor-not-allowed shadow-none"
              }`}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}