"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FollowButton from "@/app/components/FollowButton";
import { useProfileStore } from "@/app/store/profileStore";
import { Post } from "@/app/types/post";
import api from "@/app/lib/axios";
import PostCard from "@/app/components/PostCard";
import Image from "next/image";

export default function UserProfilePage() {
  const { id } = useParams();
  const { profile, loading, fetchProfile } = useProfileStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoadedFor, setPostsLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (profile?.id !== id) fetchProfile(id as string);
  }, [id]);

  useEffect(() => {
    if (!id || postsLoadedFor === id) return;
    const loadPosts = async () => {
      try {
        const { data } = await api.get(`/user/${id}/posts`);
        setPosts(data.posts);
        setPostsLoadedFor(id as string);
      } catch (err) {
        console.error(err);
      }
    };
    loadPosts();
  }, [id]);

  if (loading && !profile) {
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

  if (!profile) return null;

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

        {/* Stats + follow */}
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

          {/* FollowButton — styled via wrapper */}
          <div className="[&>button]:btn-primary [&>button]:!px-6 [&>button]:!py-2.5">
            <FollowButton targetUserId={profile.id} />
          </div>
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="flex items-center gap-3 text-[11px] text-[#a08070] tracking-[0.08em] uppercase">
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Posts
        </span>
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
      </div>

      {/* ── Posts ── */}
      <div className="flex flex-col gap-5 pb-10">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-5xl opacity-20 select-none">✦</span>
            <p className="font-display text-xl text-[#1c1917]/50 font-medium">
              No posts yet
            </p>
            <p className="text-sm text-[#a08070]">
              This user hasn&apos;t shared anything yet.
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