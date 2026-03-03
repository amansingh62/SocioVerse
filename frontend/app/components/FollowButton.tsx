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
      className={`px-4 py-2 rounded ${
        profile.isFollowing
          ? "bg-gray-300 text-black"
          : "bg-black text-white"
      }`}
    >
      {loading
        ? "Processing..."
        : profile.isFollowing
        ? "Unfollow"
        : "Follow"}
    </button>
  );
}