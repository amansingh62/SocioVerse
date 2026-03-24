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
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [bio, setBio] = useState(profile.bio || "");
  const [username, setUsername] = useState(profile.username || "");
  const [image, setImage] = useState(profile.image || "");
  const [preview, setPreview] = useState(profile.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

  const isChanged =
    bio !== profile.bio ||
    username !== profile.username ||
    image !== profile.image;

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
      },
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
      await updateProfile({ username, bio, image }, profile.id);

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
    >
      <div
        className="
        bg-[rgba(255,240,248,0.96)] backdrop-blur-[28px]
        rounded-[26px] border border-[rgba(224,86,164,0.25)]
        shadow-[0_28px_80px_rgba(224,86,164,0.18)]
        w-full max-w-[440px] flex flex-col gap-6 p-8
      "
      >

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[#7a1d4f]">
              Edit Profile
            </h2>

            <p className="text-[12px] text-[#d15a9f] mt-0.5">
              Update your public information
            </p>
          </div>

          <button
            onClick={onClose}
            className="
            w-8 h-8 rounded-full flex items-center justify-center text-xs
            border border-[rgba(224,86,164,0.30)] text-[#d15a9f]
            hover:bg-[rgba(224,86,164,0.12)]
            transition-all
          "
          >
            ✕
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">

          <div className="relative group">

            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-r from-[#E056A4] to-[#ff7bbd]">

              <div className="w-full h-full rounded-full overflow-hidden">

                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile"
                    width={88}
                    height={88}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E056A4] to-[#ff7bbd] flex items-center justify-center text-white text-3xl font-bold">
                    {(profile.name?.[0] ?? profile.username?.[0])?.toUpperCase()}
                  </div>
                )}

              </div>

            </div>

            {/* Upload overlay */}
            <label
              className="
              absolute inset-0 rounded-full flex flex-col items-center justify-center
              bg-[rgba(0,0,0,0)] group-hover:bg-[rgba(0,0,0,0.45)]
              cursor-pointer transition
            "
            >
              <span className="text-white text-xs opacity-0 group-hover:opacity-100">
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

          <p className="text-[11px] text-[#d15a9f]">
            JPG, PNG, WEBP or AVIF · Max 5 MB
          </p>

        </div>

        <div className="h-px bg-[rgba(224,86,164,0.15)]" />

        {/* Username */}
        <div className="flex flex-col gap-1.5">

          <label className="text-[11px] text-[#d15a9f] uppercase tracking-wide">
            Username
          </label>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="
            px-4 py-2.5 rounded-xl
            bg-white border border-[rgba(224,86,164,0.25)]
            focus:border-[#E056A4]
            outline-none
          "
          />

        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">

          <label className="text-[11px] text-[#d15a9f] uppercase tracking-wide">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="
            px-4 py-2.5 rounded-xl
            bg-white border border-[rgba(224,86,164,0.25)]
            focus:border-[#E056A4]
            outline-none
          "
          />

        </div>

        {error && (
          <p className="text-[12px] text-red-500">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="
            flex-1 py-2.5 rounded-xl border
            border-[rgba(224,86,164,0.30)]
            text-[#d15a9f]
          "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !isChanged}
            className="
            flex-1 py-2.5 rounded-xl
            bg-gradient-to-r from-[#E056A4] to-[#ff7bbd]
            text-white font-semibold
            disabled:opacity-40
          "
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}