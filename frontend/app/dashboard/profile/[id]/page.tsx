"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import FollowButton from "@/app/components/FollowButton";
import { useProfileStore } from "@/app/store/profileStore";

export default function UserProfilePage() {
  const { id } = useParams();
  const { profile, loading, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!id) return;

    if (profile?.id === id) return;

    fetchProfile(id as string);
  }, [id, profile, fetchProfile]);

  if (loading && !profile) return <div>Loading...</div>;

  if (!profile) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold">
        {profile.name}
      </h2>

      <p className="text-gray-600 whitespace-pre-line">
        {profile.bio}
      </p>

      <div className="flex gap-6">
        <span>{profile.followersCount} Followers</span>
        <span>{profile.followingCount} Following</span>
      </div>

      <FollowButton targetUserId={profile.id} />
    </div>
  );
}