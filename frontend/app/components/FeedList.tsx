"use client";

// ─────────────────────────────────────────
//  FeedList  (Home feed — infinite scroll)
// ─────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { usePostStore } from "../store/postStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";

export function FeedList() {
  const { postsById, feedIds, fetchFeed, loadMore, loading } = usePostStore();
  const posts     = feedIds.map((id) => postsById[id]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 1 }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-4">

      {/* Post list */}
      {posts.map((post) => post ? <PostCard key={post.id} post={post} /> : null)}

      {/* Infinite scroll trigger */}
      <div ref={bottomRef} />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
//  ExploreFeedList  (Explore / discover)
// ─────────────────────────────────────────
export function ExploreFeedList() {
  const exploreIds       = usePostStore((s) => s.exploreIds);
  const postsById        = usePostStore((s) => s.postsById);
  const fetchExploreFeed = usePostStore((s) => s.fetchExploreFeed);

  useEffect(() => { fetchExploreFeed(); }, [fetchExploreFeed]);

  const posts = exploreIds.map((id) => postsById[id]).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{
            background: "rgba(16,9,28,0.55)",
            border: "1px solid rgba(139,92,246,0.12)",
          }}
        >
          <span className="text-4xl mb-3">◆</span>
          <p className="text-[14px] font-semibold" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
            Nothing here yet
          </p>
          <p className="text-[12.5px] mt-1" style={{ color: "rgba(139,92,246,0.45)", fontFamily: "DM Sans, sans-serif" }}>
            Check back soon for new posts
          </p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post!.id} post={post!} />)
      )}
    </div>
  );
}

export default FeedList;