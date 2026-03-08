"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "../types/post";
import { useFeedStore } from "@/app/store/feedStore";
import Image from "next/image";

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  const toggleLike = useFeedStore((s) => s.toggleLike);
  const toggleSave = useFeedStore((s) => s.toggleSave);
  const deletePost = useFeedStore((s) => s.deletePost);
  const addComment = useFeedStore((s) => s.addComment);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    toggleLike(post.id);
  };

  const handleSave = () => {
    setSaved((s) => !s);
    toggleSave(post.id);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <>
      {/* Card */}
      <article className="glass-card rounded-3xl p-5 flex flex-col gap-4 post-card-hover">

        {/* Author */}
        <Link
          href={`/dashboard/profile/${post.author.id}`}
          className="flex items-center gap-3 no-underline group"
        >
          <div className="avatar-ring w-11 h-11 flex-shrink-0 shadow-[0_2px_10px_rgba(201,150,122,0.25)]">
            {post.author.image ? (
              <Image
                src={post.author.image}
                width={40}
                height={40}
                alt={post.author.username}
                className="w-full h-full rounded-full object-cover block"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center text-white font-bold text-base">
                {post.author.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-[15.5px] font-semibold text-[#1c1917] leading-none tracking-wide group-hover:text-[#a0614a] transition-colors duration-200">
              {post.author.username}
            </p>
            <p className="text-[11px] text-[#a08070] mt-0.5">
              @{post.author.username?.toLowerCase()}
            </p>
          </div>
        </Link>

        {/* Content */}
        {post.content && (
          <p className="text-[13.5px] text-[#3a2e28] leading-[1.75] whitespace-pre-line">
            {post.content}
          </p>
        )}

        {/* Image */}
        {post.mediaUrl && post.mediaType === "IMAGE" && (
          <div className="rounded-2xl overflow-hidden border border-[rgba(201,150,122,0.10)]">
            <Image
              src={post.mediaUrl}
              width={600}
              height={400}
              alt="post image"
              className="w-full max-h-[340px] object-cover block"
            />
          </div>
        )}

        {/* Video */}
        {post.mediaUrl && post.mediaType === "VIDEO" && (
          <div className="rounded-2xl overflow-hidden border border-[rgba(201,150,122,0.10)]">
            <video controls className="w-full max-h-[340px]">
              <source src={post.mediaUrl} />
            </video>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-[rgba(201,150,122,0.10)]">

          {/* Like */}
          <button onClick={handleLike} className={`btn-action ${liked ? "active" : ""}`}>
            <span className="text-[17px] leading-none select-none">
              {liked ? "♥" : "♡"}
            </span>
            <span>{likeCount}</span>
          </button>

          {/* Comments */}
          <button onClick={() => setShowComments(true)} className="btn-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{post._count.comments}</span>
          </button>

          {/* Save */}
          <button onClick={handleSave} className={`btn-action ${saved ? "active" : ""}`}>
            <svg
              viewBox="0 0 24 24"
              fill={saved ? "#c9967a" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs">{saved ? "Saved" : "Save"}</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => deletePost(post.id)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] border border-[rgba(201,97,74,0.14)] bg-[rgba(255,240,235,0.45)] text-[#b05040] cursor-pointer transition-all duration-200 hover:bg-[rgba(201,97,74,0.10)] hover:border-[rgba(201,97,74,0.30)] hover:text-[#a04030]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </article>

      {/* Comment Modal */}
      {showComments && (
        <div
          className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-5"
          onClick={(e) => e.target === e.currentTarget && setShowComments(false)}
        >
          <div className="bg-[rgba(255,253,249,0.97)] backdrop-blur-[28px] rounded-[26px] border border-[rgba(201,150,122,0.18)] shadow-[0_28px_80px_rgba(28,25,23,0.18)] w-full max-w-[460px] max-h-[78vh] overflow-y-auto p-7 flex flex-col gap-5 modal-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[22px] font-semibold text-[#1c1917] tracking-wide">
                Comments
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs border border-[rgba(201,150,122,0.22)] text-[#a08070] hover:bg-[rgba(201,150,122,0.08)] hover:text-[#a0614a] transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-2.5">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment();
                }}
                placeholder="Write something kind… (⌘↵ to send)"
                className="glass-input"
                rows={2}
              />
              <button onClick={submitComment} className="self-end btn-primary">
                Send ✦
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(201,150,122,0.10)]" />

            {/* Comments list */}
            <div className="flex flex-col gap-3.5">
              {(!post.comments || post.comments.length === 0) ? (
                <p className="text-center text-[13px] text-[#a08070] italic py-4">
                  No comments yet — be the first ✦
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-2.5 pb-3.5 border-b border-[rgba(201,150,122,0.08)] last:border-0"
                  >
                    <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center">
                      {comment.user.image ? (
                        <Image
                          src={comment.user.image}
                          width={32}
                          height={32}
                          alt={comment.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {comment.user.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-display font-semibold text-[14px] text-[#1c1917] mr-1.5">
                        {comment.user.username}
                      </span>
                      <span className="text-[13px] text-[#5a4a40] leading-relaxed">
                        {comment.content}
                      </span>
                      {comment.optimistic && (
                        <span className="text-[10px] text-[#a08070] italic ml-1.5">
                          sending…
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}