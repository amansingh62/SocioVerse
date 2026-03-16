"use client";

import { useState } from "react";
import api from "../lib/axios";
import { useProfileStore } from "../store/profileStore";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const { profile, updateFollowState } = useProfileStore();
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const handleToggle = async () => {
    if (loading) return;

    const previousState = profile.isFollowing;

    updateFollowState(!previousState);
    setLoading(true);

    try {
      if (previousState) {
        await api.delete(`/follow/${targetUserId}`);
      } else {
        await api.post(`/follow/${targetUserId}`);
      }
    } catch (err) {
      updateFollowState(previousState);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
  onClick={handleToggle}
  disabled={loading}
  className={`
    px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
    ${
      profile.isFollowing
        ? "bg-white text-[#c63c8c]"
        : "bg-gradient-to-r from-[#E056A4] to-[#ff7bbd] text-white hover:bg-none hover:bg-white hover:text-[#c63c8c] hover:border-[#E056A4]"
    }
  `}
>
  {loading
    ? "Processing..."
    : profile.isFollowing
    ? "Following"
    : "Follow"}
</button>
  );
}