"use client";

import Image from "next/image";
import Link from "next/link";
import api from "../lib/axios";
import { useEffect, useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";

export default function FeaturedProfiles() {
  const featuredIds = useProfileStore((s) => s.featuredIds);
  const profilesById = useProfileStore((s) => s.profilesById);
  const setFeaturedProfiles = useProfileStore((s) => s.setFeaturedProfiles);
  const toggleFollow = useProfileStore((s) => s.toggleFollow);
  const currentUser = useAuthStore((s) => s.user);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await api.get("/user/profiles");
        setFeaturedProfiles(data);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };

    fetchProfiles();
  }, [setFeaturedProfiles]);

  const profiles = featuredIds
    .map((id) => profilesById[id])
    .filter(Boolean) 

  const handleToggle = async (id: string) => {
    if (!currentUser || loadingId === id) return;

    setLoadingId(id);

    try {
      await toggleFollow(id, currentUser.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(248,220,234,0.86)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(248,220,234,0.3)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] text-white"
          style={{ background: "#E056A4" }}
        >
          ⭐
        </span>

        <div>
          <p className="font-[Syne] text-[14px] font-bold text-black">
            Featured Profiles
          </p>

          <p className="text-[11px] text-gray-600 mt-0.5">
            Top creators this week
          </p>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(224,86,164,0.25)",
          margin: "0 16px",
        }}
      />

      <div className="flex flex-col py-2">
        {profiles.map((profile, index) => (
          <Link
            key={profile.id}
            href={`/dashboard/profile/${profile.id}`}
            className="flex items-center gap-3 px-4 py-2.5 transition"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E056A4";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderRadius = "12px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "black";
            }}
          >
            <span
              className="text-[11px] font-bold w-4 text-center"
              style={{
                color: index < 3 ? "#E056A4" : "#999",
              }}
            >
              {index + 1}
            </span>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[14px]"
              style={{
                background: "#E056A4",
                border: "2px solid rgba(224,86,164,0.3)",
              }}
            >
              {profile.image ? (
                <Image
                  src={profile.image}
                  width={36}
                  height={36}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-[13px] font-semibold truncate text-black">
                  {profile.username}
                </p>

                {profile.isFollowing && (
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: "#E056A4" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      className="w-2 h-2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-600 mt-0.5">
                {profile.followersCount} followers
              </p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleToggle(profile.id);
              }}
              className="text-xs font-semibold px-2 py-1 rounded-md"
              style={{
                background: profile.isFollowing ? "#ddd" : "#E056A4",
                color: profile.isFollowing ? "#333" : "white",
              }}
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}