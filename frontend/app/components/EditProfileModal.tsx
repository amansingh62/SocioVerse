"use client";

import { useState } from "react";
import { Profile } from "../types/profile";
import api from "../lib/axios";
import Image from "next/image";
import { useProfileStore } from "@/app/store/profileStore";

export default function EditProfileModal({
profile,
onClose,
}: {
profile: Profile;
onClose: () => void;
}) {
const updateProfileData = useProfileStore((s) => s.updateProfileData);

const [bio, setBio] = useState(profile.bio || "");
const [username, setUsername] = useState(profile.username || "");
const [image, setImage] = useState(profile.image || "");
const [preview, setPreview] = useState(profile.image || "");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
"image/jpeg",
"image/png",
"image/webp",
"image/avif",
];

const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file) return;
if (!ALLOWED_TYPES.includes(file.type)) {
  setError("Only JPG, PNG, WEBP or AVIF allowed.");
  return;
}

if (file.size > MAX_FILE_SIZE) {
  setError("Image must be under 5 MB.");
  return;
}

setError("");

const { data } = await api.get<{ url: string; key: string }>(
  "/user/upload-url",
  {
    params: {
      fileType: file.type,
      fileSize: file.size,
    },
  }
);

await fetch(data.url, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file,
});

const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${data.key}`;

setPreview(imageUrl);
setImage(imageUrl);
};

const handleSave = async () => {
setLoading(true);
setError("");

try {
  const { data } = await api.patch("/user/profile", {
    username,
    bio,
    image,
  });

  updateProfileData(data);
  onClose();
} catch {
  setError("Update failed. Please try again.");
} finally {
  setLoading(false);
}

};

return (
<div
className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-5"
onClick={(e) => e.target === e.currentTarget && onClose()}
> <div
     className="
     bg-[rgba(255,253,249,0.97)] backdrop-blur-[28px]
     rounded-[26px] border border-[rgba(201,150,122,0.18)]
     shadow-[0_28px_80px_rgba(28,25,23,0.18)]
     w-full max-w-[440px] flex flex-col gap-6 p-8
     modal-slide-up
   "
   >
{/* Header */} <div className="flex items-center justify-between"> <div> <h2 className="font-display text-[24px] font-semibold text-[#1c1917] tracking-wide">
Edit Profile </h2> <p className="text-[12px] text-[#a08070] mt-0.5">
Update your public information </p> </div>

      <button
        onClick={onClose}
        className="
          w-8 h-8 rounded-full flex items-center justify-center text-xs
          border border-[rgba(201,150,122,0.22)] text-[#a08070]
          hover:bg-[rgba(201,150,122,0.08)] hover:text-[#a0614a]
          transition-all duration-200
        "
      >
        ✕
      </button>
    </div>

    {/* Avatar upload */}
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="avatar-ring w-24 h-24 shadow-[0_6px_24px_rgba(201,150,122,0.28)]">
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              width={88}
              height={88}
              className="w-full h-full rounded-full object-cover block"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center text-white font-display font-bold text-3xl">
              {(profile.name?.[0] ??
                profile.username?.[0])?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Upload overlay */}
        <label
          className="
          absolute inset-0 rounded-full flex flex-col items-center justify-center
          bg-[rgba(28,25,23,0)] group-hover:bg-[rgba(28,25,23,0.45)]
          cursor-pointer transition-all duration-200
        "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>

          <span className="text-white text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
            Change
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </div>

      <p className="text-[11px] text-[#a08070]">
        JPG, PNG, WEBP or AVIF · Max 5 MB
      </p>
    </div>

    {/* Divider */}
    <div className="h-px bg-[rgba(201,150,122,0.10)]" />

    {/* Username */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-medium text-[#a08070] tracking-wider uppercase">
        Username
      </label>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a090] text-sm select-none">
          @
        </span>

        <input
          type="text"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase())
          }
          className="glass-input pl-8"
        />
      </div>
    </div>

    {/* Bio */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-medium text-[#a08070] tracking-wider uppercase">
        Bio
      </label>

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="glass-input"
        rows={3}
      />

      <p className="text-[11px] text-[#b0a090] self-end">
        {bio.length} / 160
      </p>
    </div>

    {/* Error */}
    {error && (
      <p className="text-[12.5px] text-[#c05040] bg-[rgba(201,80,64,0.06)] border border-[rgba(201,80,64,0.15)] rounded-xl px-4 py-2.5">
        {error}
      </p>
    )}

    {/* Buttons */}
    <div className="flex items-center gap-3 pt-1">
      <button
        onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[rgba(201,150,122,0.22)] text-[#a08070]"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex-1 btn-primary flex items-center justify-center gap-2"
      >
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </div>
  </div>
</div>
);
}
