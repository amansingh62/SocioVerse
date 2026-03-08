"use client";

import CreatePostModal from "../components/CreatePostModal";
import FeedList from "../components/FeedList";

export default function Dashboard() {
  return (
    <div className="max-w-[600px] mx-auto flex flex-col gap-7">

      {/* Page header */}
      <div>
        <h1 className="font-display text-[42px] font-light text-[#1c1917] leading-none tracking-tight">
          Your Feed
        </h1>
        <p className="text-[13px] text-[#a08070] mt-1.5">
          What&apos;s happening in your world
        </p>
      </div>

      {/* Create post */}
      <CreatePostModal />

      {/* Divider */}
      <div className="flex items-center gap-3 text-[11px] text-[#a08070] tracking-[0.08em] uppercase">
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
        <span>Recent posts</span>
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
      </div>

      {/* Feed */}
      <FeedList />
    </div>
  );
}