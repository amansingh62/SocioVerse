"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FollowButton from "@/components/FollowButton";
import api from "@/app/lib/axios";

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/user/${id}`);
      setProfile(data);
    };

    load();
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold">
        {profile.name}
      </h2>

      <p>{profile.bio}</p>

      <div className="flex gap-6">
        <span>{profile.followersCount} Followers</span>
        <span>{profile.followingCount} Following</span>
      </div>

      <FollowButton targetUserId={profile.id} />
    </div>
  );
}