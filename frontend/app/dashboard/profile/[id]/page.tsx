"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import FollowButton from "@/app/components/FollowButton";
import { useProfileStore } from "@/app/store/profileStore";
import { usePostStore } from "@/app/store/postStore";
import PostCard from "@/app/components/PostCard";
import Image from "next/image";

export default function UserProfilePage() {
const { id } = useParams();

const { profile, loading, fetchProfile } = useProfileStore();

const { postsById, profileIds, fetchProfilePosts } = usePostStore();

const posts = profileIds.map((id) => postsById[id]).filter(Boolean);

useEffect(() => {
if (!id) return;
fetchProfile(id as string);
fetchProfilePosts(id as string);
}, [id]);

if (loading && !profile) {
return ( <div className="flex items-center justify-center h-64"> <div className="flex gap-1.5"> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse" /> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-2" /> <span className="w-2 h-2 rounded-full bg-[#c9967a] dot-pulse-3" /> </div> </div>
);
}

if (!profile) return null;

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

      <div className="flex-1">
        <h2 className="font-display text-[28px] font-semibold text-[#1c1917]">
          {profile.name}
        </h2>

        <p className="text-[13px] text-[#a08070]">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="text-[13.5px] text-[#5a4a40] mt-2">
            {profile.bio}
          </p>
        )}
      </div>
    </div>

    {/* Stats */}
    <div className="flex items-center justify-between pt-5 border-t border-[rgba(201,150,122,0.12)]">

      <div className="flex gap-6">
        {[
          { value: profile.followersCount ?? 0, label: "Followers" },
          { value: profile.followingCount ?? 0, label: "Following" },
          { value: posts.length, label: "Posts" },
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

      <div className="[&>button]:btn-primary [&>button]:!px-6 [&>button]:!py-2.5">
        <FollowButton targetUserId={profile.id} />
      </div>
    </div>
  </div>

  {/* Section Label */}
  <div className="flex items-center gap-3 text-[11px] text-[#a08070] tracking-[0.08em] uppercase">
    <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
    <span className="flex items-center gap-1.5">
      Posts
    </span>
    <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
  </div>

  {/* Posts */}
  <div className="flex flex-col gap-5 pb-10">
    {posts.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl opacity-20">✦</span>
        <p className="font-display text-xl text-[#1c1917]/50">
          No posts yet
        </p>
      </div>
    ) : (
      posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))
    )}
  </div>

</div>
);
}
