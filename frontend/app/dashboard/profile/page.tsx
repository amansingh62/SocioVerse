"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/app/store/profileStore";
import { useAuthStore } from "@/app/store/authStore";
import { usePostStore } from "@/app/store/postStore";
import Image from "next/image";
import PostCard from "@/app/components/PostCard";
import EditProfileModal from "@/app/components/EditProfileModal";
import { ProfilePageSkeleton } from "@/app/components/skeleton/ProfilePageSkeleton";

export default function MyProfilePage() {
  const user = useAuthStore((s) => s.user);

  const profile = useProfileStore((s) =>
    user ? s.profilesById[user.id] : undefined
  );

  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const ensureProfilePosts = usePostStore((s) => s.ensureProfilePosts);
  const ensureSavedPosts = usePostStore((s) => s.ensureSavedPosts);

  const profilePostIds = usePostStore((s) =>
    user ? s.profilePostIdsByUser[user.id] : undefined
  );

  const savedIds = usePostStore((s) => s.savedIds);
  const postsById = usePostStore((s) => s.postsById);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  const myPosts = (profilePostIds ?? []).map((id) => postsById[id]).filter(Boolean);
  const savedPosts = savedIds.map((id) => postsById[id]).filter(Boolean);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id);
    ensureProfilePosts(user.id);
    ensureSavedPosts();
  }, [user, fetchProfile, ensureProfilePosts, ensureSavedPosts]);

  if (!profile) return <ProfilePageSkeleton />;

  const displayPosts = activeTab === "posts" ? myPosts : savedPosts;

  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-6 sm:gap-8">

      <div className="rounded-3xl p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 bg-[rgba(255,230,242,0.85)] border border-[rgba(224,86,164,0.25)] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">

        <div className="flex items-start gap-4 sm:gap-6">

          <div className="w-[72px] h-[72px] sm:w-24 sm:h-24 shrink-0 rounded-full p-[3px] bg-gradient-to-r from-[#E056A4] to-[#ff7bbd]">
            <div className="w-full h-full rounded-full overflow-hidden">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt="Profile"
                  width={88}
                  height={88}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E056A4] to-[#ff7bbd] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {(profile.name?.[0] ?? profile.username?.[0])?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-[22px] sm:text-[28px] font-light text-black leading-tight truncate">
              {profile.name}
            </h2>
            <p className="text-[12px] sm:text-[13px] text-black/60">@{profile.username}</p>

            {profile.bio && (
              <p className="text-[13px] sm:text-[13.5px] mt-2 sm:mt-4 text-black whitespace-pre-line line-clamp-3 sm:line-clamp-none">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-5 border-t border-[rgba(224,86,164,0.18)]">

          <div className="flex gap-4 sm:gap-6">
            {[
              { value: profile.followersCount ?? 0, label: "Followers" },
              { value: profile.followingCount ?? 0, label: "Following" },
              { value: myPosts.length, label: "Posts" },
            ].map(({ value, label }, i, arr) => (
              <div key={label} className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-[18px] sm:text-[22px] font-semibold text-black">{value}</p>
                  <p className="text-[10px] sm:text-[11px] text-pink-300 uppercase">{label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-7 sm:h-8 bg-[rgba(224,86,164,0.18)]" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E056A4] to-[#ff7bbd] text-white text-sm font-medium transition-all duration-200 hover:from-white hover:to-white hover:text-[#c63c8c] border border-transparent hover:border-[#E056A4]"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(224,86,164,0.08)]">
        {(["posts", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? "bg-[#E056A4] text-white" : "text-pink-300"
            }`}
          >
            {tab === "posts" ? "My Posts" : "Saved"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 pb-10">
        {displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-5xl opacity-20">
              {activeTab === "posts" ? "✦" : "🔖"}
            </span>
            <p className="text-xl text-pink-200">
              {activeTab === "posts" ? "No posts yet" : "Nothing saved yet"}
            </p>
          </div>
        ) : (
          displayPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {open && <EditProfileModal profile={profile} onClose={() => setOpen(false)} />}
    </div>
  );
}