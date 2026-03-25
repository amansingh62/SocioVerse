"use client";

import { useEffect, useRef } from "react";
import { usePostStore } from "../store/postStore";
import PostCard from "./PostCard";
import { PostCardSkeleton } from "./skeleton/PostSkeleton";

export function FeedList() {
  const { postsById, feedIds, fetchFeed, loadMore, loading, selectedTag } =
    usePostStore();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1 },
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

  const loadingFeed = usePostStore((s) => s.loadingFeed);
  const isInitialLoading = loadingFeed && feedIds.length === 0;

  if (!isInitialLoading && posts.length === 0 && selectedTag) {
    return (
      <div className="text-center py-10 text-[#E056A4] text-sm">
        No posts with #{selectedTag}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isInitialLoading
        ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
        : posts.map((post) =>
            post ? <PostCard key={post.id} post={post} /> : null,
          )}

      <div ref={bottomRef} />

      {loading && feedIds.length > 0 && (
        <div className="flex flex-col gap-4 pt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <PostCardSkeleton key={`load-${i}`} />
          ))}
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

  const loadingExplore = usePostStore((s) => s.loadingExplore);
  const isInitialLoading = loadingExplore && exploreIds.length === 0;

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  const filteredIds = exploreIds.filter((id) => {
    if (!selectedTag) return true;
    const tags = postsById[id]?.hashtags || [];
    return tags.includes(selectedTag);
  });

  const posts = filteredIds.map((id) => postsById[id]).filter(Boolean);

  if (!isInitialLoading && posts.length === 0 && selectedTag) {
    return (
      <div className="text-center py-10 text-[#E056A4] text-sm">
        No explore posts with #{selectedTag}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {isInitialLoading
        ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
        : posts.map((post) => <PostCard key={post.id} post={post} />)}

      {loadingExplore &&
        exploreIds.length > 0 &&
        Array.from({ length: 2 }).map((_, i) => (
          <PostCardSkeleton key={`load-${i}`} />
        ))}
    </div>
  );
}

export default FeedList;
