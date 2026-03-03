"use client";

import { useState } from "react";
import api from "../lib/axios";
import { Profile } from "../types/profile";
import Image from "next/image";

export default function EditProfileModal({
  profile,
  onClose,
  onUpdate,
}: {
  profile: Profile;
  onClose: () => void;
  onUpdate: (data: Profile) => void;
}) {
  const [bio, setBio] = useState(profile.bio || "");
  const [image, setImage] = useState(profile.image || "");
  const [preview, setPreview] = useState(profile.image || "");
  const [loading, setLoading] = useState(false);

const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const { data } = await api.get(
    `/user/upload-url?fileType=${file.type}`
  );

  await fetch(data.url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${data.key}`;

  setPreview(imageUrl);
  setImage(imageUrl);
};

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch("/user/profile", {
        bio,
        image,
      });
      onUpdate(data);
      onClose();
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Edit Profile</h2>

        {preview && (
          <Image
  src={preview}
  alt="Profile"
  width={96}
  height={96}
  className="w-24 h-24 rounded-full object-cover"
/>
        )}

        <input type="file" accept="image/*" onChange={handleFile} />

        <textarea
          className="border p-2 w-full"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
