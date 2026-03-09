"use client";

import { useState } from "react";
import CreatePostModal from "../components/CreatePostModal";
import FeedList from "../components/FeedList";
import ExploreFeedList from "../components/ExploreFeedList";

export default function Dashboard() {
  const [tab, setTab] = useState<"feed" | "explore">("feed");

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

      {/* Feed Switcher */}
      <div className="flex gap-2 bg-[rgba(201,150,122,0.08)] p-1 rounded-xl">

        <button
          onClick={() => setTab("feed")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === "feed"
              ? "bg-white text-[#1c1917] shadow"
              : "text-[#a08070]"
          }`}
        >
          Following
        </button>

        <button
          onClick={() => setTab("explore")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === "explore"
              ? "bg-white text-[#1c1917] shadow"
              : "text-[#a08070]"
          }`}
        >
          Explore
        </button>

      </div>

      {/* Create post only for Following feed */}
      {tab === "feed" && <CreatePostModal />}

      {/* Divider */}
      <div className="flex items-center gap-3 text-[11px] text-[#a08070] tracking-[0.08em] uppercase">
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
        <span>{tab === "feed" ? "Recent posts" : "Explore posts"}</span>
        <span className="flex-1 h-px bg-[rgba(201,150,122,0.18)]" />
      </div>

      {/* Feed */}
      {tab === "feed" ? <FeedList /> : <ExploreFeedList />}
    </div>
  );
}