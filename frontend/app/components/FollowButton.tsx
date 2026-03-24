"use client";

import { useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const currentUser = useAuthStore((s) => s.user);

  const profile = useProfileStore(
    (s) => s.profilesById[targetUserId]
  );

  const toggleFollow = useProfileStore((s) => s.toggleFollow);

  const [loading, setLoading] = useState(false);

  if (!profile || !currentUser) return null;

  if (currentUser.id === targetUserId) return null;

  const isFollowing = profile.isFollowing;

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await toggleFollow(targetUserId, currentUser.id);
    } catch (err) {
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
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
        ${
          isFollowing
            ? "bg-white text-[#c63c8c]"
            : "bg-gradient-to-r from-[#E056A4] to-[#ff7bbd] text-white hover:bg-white hover:text-[#c63c8c] hover:border hover:border-[#E056A4]"
        }
      `}
    >
      {loading
        ? "Processing..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </button>
  );
}