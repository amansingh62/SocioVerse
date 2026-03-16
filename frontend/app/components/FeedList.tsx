"use client";

import { useEffect, useRef } from "react";
import { usePostStore } from "../store/postStore";
import PostCard from "./PostCard";

export function FeedList() {
  const {
    postsById,
    feedIds,
    fetchFeed,
    loadMore,
    loading,
    selectedTag,
  } = usePostStore();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1 }
    );

    if (bottomRef.current) observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [loadMore]);

  const filteredIds = feedIds.filter((id) => {
    if (!selectedTag) return true;

    const tags = postsById[id]?.hashtags || [];
    return tags.includes(selectedTag);
  });

  const posts = filteredIds.map((id) => postsById[id]);

  if (posts.length === 0 && selectedTag) {
    return (
      <div className="text-center py-10 text-[#E056A4] text-sm">
        No posts with #{selectedTag}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) =>
        post ? <PostCard key={post.id} post={post} /> : null
      )}

      <div ref={bottomRef} />

      {loading && (
        <div className="text-center py-6 text-[#E056A4] text-sm">
          Loading...
        </div>
      )}
    </div>
  );
}

export function ExploreFeedList() {
  const exploreIds = usePostStore((s) => s.exploreIds);
  const postsById = usePostStore((s) => s.postsById);
  const fetchExploreFeed = usePostStore((s) => s.fetchExploreFeed);
  const selectedTag = usePostStore((s) => s.selectedTag);

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  const filteredIds = exploreIds.filter((id) => {
    if (!selectedTag) return true;

    const tags = postsById[id]?.hashtags || [];
    return tags.includes(selectedTag);
  });

  const posts = filteredIds.map((id) => postsById[id]).filter(Boolean);

  if (posts.length === 0 && selectedTag) {
    return (
      <div className="text-center py-10 text-[#E056A4] text-sm">
        No explore posts with #{selectedTag}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post!.id} post={post!} />
      ))}
    </div>
  );
}

export default FeedList;