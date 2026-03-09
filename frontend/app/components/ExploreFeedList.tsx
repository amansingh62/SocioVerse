"use client";

import { useEffect } from "react";
import { usePostStore } from "../store/postStore";
import PostCard from "./PostCard";

export default function ExploreFeedList() {

  const exploreIds = usePostStore((s) => s.exploreIds);
  const postsById = usePostStore((s) => s.postsById);
  const fetchExploreFeed = usePostStore((s) => s.fetchExploreFeed);

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  const posts = exploreIds.map((id) => postsById[id]).filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}