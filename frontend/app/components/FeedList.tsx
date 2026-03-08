"use client";

import { useEffect, useRef } from "react";
import { usePostStore } from "../store/postStore";
import PostCard from "./PostCard";

export default function FeedList() {
const { postsById, feedIds, fetchFeed, loadMore, loading } =
usePostStore();

const posts = feedIds.map((id) => postsById[id]);

const bottomRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
fetchFeed();
}, [fetchFeed]);

useEffect(() => {
const observer = new IntersectionObserver(
(entries) => {
if (entries[0].isIntersecting) {
loadMore();
}
},
{ threshold: 1 }
);

if (bottomRef.current) {
  observer.observe(bottomRef.current);
}

return () => observer.disconnect();

}, [loadMore]);

return ( <div className="space-y-4">
{posts.map((post) =>
post ? <PostCard key={post.id} post={post} /> : null
)}

  <div ref={bottomRef} />

  {loading && (
    <div className="text-center text-sm text-gray-500">
      Loading more posts...
    </div>
  )}
</div>
);
}
