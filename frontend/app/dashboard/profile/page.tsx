"use client";

import { useEffect, useState } from "react";
import EditProfileModal from "../../components/EditProfileModal";
import { useProfileStore } from "@/app/store/profileStore";
import api from "@/app/lib/axios";

export default function MyProfilePage() {
  const {
    profile,
    loading,
    fetchProfile,
    updateProfileData,
  } = useProfileStore();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: me } = await api.get("/auth/me");
      await fetchProfile(me.id);
    };

    load();
  }, [fetchProfile]);

  if (loading || !profile) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        {profile.image && (
          <img
            src={profile.image}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">
            {profile.name}
          </h2>
          <p className="text-gray-600">{profile.bio}</p>
        </div>
      </div>

      <div className="flex gap-6">
        <span>{profile.followersCount} Followers</span>
        <span>{profile.followingCount} Following</span>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Edit Profile
      </button>

      {open && (
        <EditProfileModal
          profile={profile}
          onClose={() => setOpen(false)}
          onUpdate={(updated) => updateProfileData(updated)}
        />
      )}
    </div>
  );
}