"use client";

import { useEffect, useState } from "react";
import EditProfileModal from "../../components/EditProfileModal";
import { useProfileStore } from "@/app/store/profileStore";
import { useAuthStore } from "@/app/store/authStore";
import Image from "next/image";
import PostCard from "@/app/components/PostCard";

export default function MyProfilePage() {
  const {
    profile,
    posts,
    savedPosts,
    fetchProfile,
    fetchPosts,
    fetchSavedPosts,
    updateProfileData,
  } = useProfileStore();

  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id);
    fetchPosts(user.id);
    fetchSavedPosts();
  }, [user]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse" />
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-2" />
          <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-3" />
        </div>
      </div>
    );
  }

  const displayPosts = activeTab === "posts" ? posts : savedPosts;

  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-8">

      {/* ── Profile Hero Card ── */}
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">

        {/* Avatar + info */}
        <div className="flex items-start gap-6">
          <div className="avatar-ring w-24 h-24 flex-shrink-0 shadow-[0_6px_28px_rgba(201,150,122,0.30)]">
            {profile.image ? (
              <Image
                src={profile.image}
                alt="Profile"
                width={88}
                height={88}
                className="w-full h-full rounded-full object-cover block"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center text-white font-display font-bold text-3xl">
                {(profile.name?.[0] ?? profile.username?.[0])?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h2 className="font-display text-[28px] font-semibold text-[#1c1917] leading-tight tracking-tight">
              {profile.name}
            </h2>
            <p className="text-[13px] text-[#a08070] mt-0.5 mb-3">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-[13.5px] text-[#5a4a40] leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats + edit */}
        <div className="flex items-center justify-between pt-5 border-t border-[rgba(201,150,122,0.12)]">
          <div className="flex gap-6">
            {[
              { value: profile.followersCount ?? 0, label: "Followers" },
              { value: profile.followingCount ?? 0, label: "Following" },
              { value: posts.length,                label: "Posts" },
            ].map(({ value, label }, i, arr) => (
              <div key={label} className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-[22px] font-semibold text-[#1c1917] leading-none">
                    {value}
                  </p>
                  <p className="text-[11px] text-[#a08070] mt-1 tracking-wider uppercase">
                    {label}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-8 bg-[rgba(201,150,122,0.15)]" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              border border-[rgba(201,150,122,0.28)] text-[#a0614a]
              bg-[rgba(201,150,122,0.06)] transition-all duration-200
              hover:bg-[rgba(201,150,122,0.12)] hover:border-[rgba(201,150,122,0.45)]
            "
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {open && (
        <EditProfileModal
          profile={profile}
          onClose={() => setOpen(false)}
          onUpdate={(updated) => updateProfileData(updated)}
        />
      )}

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(201,150,122,0.08)] border border-[rgba(201,150,122,0.14)]">
        {(["posts", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200
              ${activeTab === tab
                ? "bg-white shadow-[0_2px_12px_rgba(160,97,74,0.12)] text-[#a0614a] border border-[rgba(201,150,122,0.20)]"
                : "text-[#a08070] hover:text-[#5a4a40]"
              }
            `}
          >
            {tab === "posts" ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                My Posts
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill={activeTab === "saved" ? "#c9967a" : "none"} stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Saved
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Post grid ── */}
      <div className="flex flex-col gap-5 pb-10">
        {displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-5xl opacity-20 select-none">
              {activeTab === "posts" ? "✦" : "🔖"}
            </span>
            <p className="font-display text-xl text-[#1c1917]/50 font-medium">
              {activeTab === "posts" ? "No posts yet" : "Nothing saved yet"}
            </p>
            <p className="text-sm text-[#a08070]">
              {activeTab === "posts"
                ? "Share something beautiful with the world."
                : "Bookmark posts to find them here."}
            </p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}