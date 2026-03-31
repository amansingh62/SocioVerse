"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import FollowButton from "@/app/components/FollowButton";
import { useProfileStore } from "@/app/store/profileStore";
import { usePostStore } from "@/app/store/postStore";
import PostCard from "@/app/components/PostCard";
import Image from "next/image";
import api from "@/app/lib/axios";
import { ProfilePageSkeleton } from "@/app/components/skeleton/ProfilePageSkeleton";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const userId = id as string;

  const profile = useProfileStore((s) =>
    userId ? s.profilesById[userId] : undefined
  );
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const loading = useProfileStore((s) => s.loading);

  const profilePostIds = usePostStore((s) =>
    userId ? s.profilePostIdsByUser[userId] : undefined
  );
  const postsById = usePostStore((s) => s.postsById);

  const ensureProfilePosts = usePostStore((s) => s.ensureProfilePosts);

  const posts = (profilePostIds ?? [])
    .map((id) => postsById[id])
    .filter(Boolean);

  useEffect(() => {
    if (!userId) return;

    fetchProfile(userId);
    ensureProfilePosts(userId);
  }, [userId, fetchProfile, ensureProfilePosts]);

  const handleMessage = async () => {
    if (!profile) return;

    try {
      const res = await api.post("/message/start", {
        receiverId: profile.id,
      });

      router.push(`/dashboard/messages/${res.data.id}`);
    } catch (err: unknown) {
      console.log(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading && !profile) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) return null;

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
              { value: posts.length, label: "Posts" },
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

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleMessage}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#E056A4] hover:bg-[#d84a98] transition"
            >
              Message
            </button>

            <div className="flex-1 sm:flex-none">
              <FollowButton targetUserId={profile.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-pink-300 tracking-[0.08em] uppercase">
        <span className="flex-1 h-px bg-[rgba(224,86,164,0.18)]" />
        <span>Posts</span>
        <span className="flex-1 h-px bg-[rgba(224,86,164,0.18)]" />
      </div>

      <div className="flex flex-col gap-5 pb-10">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-5xl opacity-20">✦</span>
            <p className="text-xl text-pink-200">No posts yet</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}