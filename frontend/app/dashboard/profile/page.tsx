"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/app/store/profileStore";
import { useAuthStore } from "@/app/store/authStore";
import { usePostStore } from "@/app/store/postStore";
import Image from "next/image";
import PostCard from "@/app/components/PostCard";
import EditProfileModal from "@/app/components/EditProfileModal";

export default function MyProfilePage() {
const { profile, fetchProfile } = useProfileStore();
const { user } = useAuthStore();

const {
postsById,
profileIds,
savedIds,
fetchProfilePosts,
fetchSavedPosts,
} = usePostStore();

const [open, setOpen] = useState(false);
const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

const myPosts = profileIds.map((id) => postsById[id]).filter(Boolean);
const savedPosts = savedIds.map((id) => postsById[id]).filter(Boolean);

useEffect(() => {
  if (!user) return;

  if (!profile) {
    fetchProfile(user.id);
  }

  if (profileIds.length === 0) {
    fetchProfilePosts(user.id);
  }

  if (savedIds.length === 0) {
    fetchSavedPosts();
  }
}, [user, profile, profileIds.length, savedIds.length, fetchProfile, fetchProfilePosts, fetchSavedPosts]);

if (!profile) {
return ( <div className="flex items-center justify-center h-64"> <div className="flex gap-1.5"> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse" /> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-2" /> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-3" /> </div> </div>
);
}

const displayPosts = activeTab === "posts" ? myPosts : savedPosts;

return ( <div className="max-w-[640px] mx-auto flex flex-col gap-8">
  {/* Profile Card */}
  <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">

    <div className="flex items-start gap-6">
      <div className="avatar-ring w-24 h-24 flex-shrink-0 shadow-[0_6px_28px_rgba(201,150,122,0.30)]">
        {profile.image ? (
          <Image
            src={profile.image}
            alt="Profile"
            width={88}
            height={88}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center text-white font-display font-bold text-3xl">
            {(profile.name?.[0] ?? profile.username?.[0])?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <h2 className="font-display text-[28px] font-semibold text-[#1c1917]">
          {profile.name}
        </h2>

        <p className="text-[13px] text-[#a08070]">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="text-[13.5px] text-[#5a4a40] whitespace-pre-line">
            {profile.bio}
          </p>
        )}
      </div>
    </div>

        {/* Edit Profile Modal */}
    {open && (
      <EditProfileModal
        profile={profile}
        onClose={() => setOpen(false)}
      />
    )}

    {/* Stats */}
    <div className="flex items-center justify-between pt-5 border-t border-[rgba(201,150,122,0.12)]">
      <div className="flex gap-6">
        {[
          { value: profile.followersCount ?? 0, label: "Followers" },
          { value: profile.followingCount ?? 0, label: "Following" },
          { value: myPosts.length, label: "Posts" },
        ].map(({ value, label }, i, arr) => (
          <div key={label} className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-[22px] font-semibold text-[#1c1917]">
                {value}
              </p>
              <p className="text-[11px] text-[#a08070] uppercase">
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
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[rgba(201,150,122,0.28)] text-[#a0614a] bg-[rgba(201,150,122,0.06)] hover:bg-[rgba(201,150,122,0.12)]"
      >
        Edit Profile
      </button>
    </div>
  </div>

  {/* Tabs */}
  <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(201,150,122,0.08)] border border-[rgba(201,150,122,0.14)]">
    {(["posts", "saved"] as const).map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
          activeTab === tab
            ? "bg-white text-[#a0614a]"
            : "text-[#a08070]"
        }`}
      >
        {tab === "posts" ? "My Posts" : "Saved"}
      </button>
    ))}
  </div>

  {/* Posts */}
  <div className="flex flex-col gap-5 pb-10">
    {displayPosts.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl opacity-20">
          {activeTab === "posts" ? "✦" : "🔖"}
        </span>
        <p className="font-display text-xl text-[#1c1917]/50">
          {activeTab === "posts" ? "No posts yet" : "Nothing saved yet"}
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
