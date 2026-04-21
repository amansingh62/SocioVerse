"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import { usePostStore } from "../store/postStore";
import { TrendingHashtagsSkeleton } from "./skeleton/TrendingHashtags";

interface Hashtag {
  tag: string;
  count: number;
}

export default function TrendingHashtags() {
  const selectedTag = usePostStore((s) => s.selectedTag);
  const setSelectedTag = usePostStore((s) => s.setSelectedTag);

  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/post/hashtags/trending");
        setHashtags(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    
  }, []);

  if (loading && hashtags.length === 0) {
    return <TrendingHashtagsSkeleton />;
  }

  return (
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(248, 220, 234, 0.86)",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        backdropFilter: "blur(15.2px)",
        WebkitBackdropFilter: "blur(15.2px)",
        border: "1px solid rgba(248,220,234,0.3)",
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
          style={{ background: "#E056A4" }}
        >
          #
        </span>

        <div>
          <p className="text-sm font-bold text-black">Trending Hashtags</p>
          <p className="text-xs text-gray-700">
            Explore what&apos;s hot right now
          </p>
        </div>
      </div>

      {selectedTag && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setSelectedTag(null)}
            className="text-xs text-gray-700 hover:text-black"
          >
            Clear filter ✕
          </button>
        </div>
      )}

      <div className="flex flex-col py-2">
        {hashtags.map(({ tag, count }, i) => {
          const isHovered = hovered === tag;
          const active = selectedTag === tag;

          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              onMouseEnter={() => setHovered(tag)}
              onMouseLeave={() => setHovered(null)}
              className="flex justify-between px-4 py-2 text-left transition rounded-xl"
              style={{
                background: active || isHovered ? "#E056A4" : "transparent",
                color: active || isHovered ? "#fff" : "#000",
              }}
            >
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-600">{i + 1}</span>

                <span className="text-sm font-semibold">#{tag}</span>
              </div>

              <span className="text-xs">{count} posts</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
