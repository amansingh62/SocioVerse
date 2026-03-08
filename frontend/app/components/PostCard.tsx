"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "../types/post";
import { usePostStore } from "../store/postStore"; 
import { useAuthStore } from "../store/authStore"; 
import Image from "next/image";

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [replyTo,      setReplyTo]      = useState<string | null>(null);

  const storePost   = usePostStore((s) => s.postsById[post.id]);
  const currentPost = storePost ?? post;

  const toggleLike      = usePostStore((s) => s.toggleLike);
  const toggleSave      = usePostStore((s) => s.toggleSave);
  const deletePost      = usePostStore((s) => s.deletePost);
  const addComment      = usePostStore((s) => s.addComment);
  const fetchAllComments = usePostStore((s) => s.fetchAllComments);
  const deleteComment   = usePostStore((s) => s.deleteComment);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(currentPost.id, commentText, replyTo);
    setCommentText("");
    setReplyTo(null);
  };

  const comments       = currentPost.comments ?? [];
  const parentComments = comments.filter((c) => !c.parentId);
  const replies        = comments.filter((c) =>  c.parentId);

  return (
    <>
      {/* ── Post Card ── */}
      <article className="glass-card rounded-3xl p-5 flex flex-col gap-4 post-card-hover">

        {/* Author */}
        <Link
          href={`/dashboard/profile/${currentPost.author.id}`}
          className="flex items-center gap-3 no-underline group"
        >
          <div className="avatar-ring w-11 h-11 flex-shrink-0 shadow-[0_2px_10px_rgba(201,150,122,0.25)]">
            {currentPost.author.image ? (
              <Image
                src={currentPost.author.image}
                width={40}
                height={40}
                alt={currentPost.author.username}
                className="w-full h-full rounded-full object-cover block"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center text-white font-bold text-base">
                {currentPost.author.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-[15.5px] font-semibold text-[#1c1917] leading-none tracking-wide group-hover:text-[#a0614a] transition-colors duration-200">
              {currentPost.author.username}
            </p>
            <p className="text-[11px] text-[#a08070] mt-0.5">
              @{currentPost.author.username?.toLowerCase()}
            </p>
          </div>
        </Link>

        {/* Content */}
        {currentPost.content && (
          <p className="text-[13.5px] text-[#3a2e28] leading-[1.75] whitespace-pre-line">
            {currentPost.content}
          </p>
        )}

        {/* Image */}
        {currentPost.mediaUrl && currentPost.mediaType === "IMAGE" && (
          <div className="rounded-2xl overflow-hidden border border-[rgba(201,150,122,0.10)]">
            <Image
              src={currentPost.mediaUrl}
              width={600}
              height={400}
              alt="post"
              className="w-full max-h-[340px] object-cover block"
            />
          </div>
        )}

        {/* Video */}
        {currentPost.mediaUrl && currentPost.mediaType === "VIDEO" && (
          <div className="rounded-2xl overflow-hidden border border-[rgba(201,150,122,0.10)]">
            <video controls className="w-full max-h-[340px]">
              <source src={currentPost.mediaUrl} />
            </video>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-[rgba(201,150,122,0.10)]">

          {/* Like */}
          <button
            onClick={() => toggleLike(currentPost.id)}
            className={`btn-action ${currentPost.isLiked ? "active" : ""}`}
          >
            <span className="text-[17px] leading-none select-none">
              {currentPost.isLiked ? "♥" : "♡"}
            </span>
            <span>{currentPost._count.likes}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="btn-action"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{currentPost._count.comments}</span>
          </button>

          {/* Save */}
          <button
            onClick={() => toggleSave(currentPost.id)}
            className={`btn-action ${currentPost.isSaved ? "active" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={currentPost.isSaved ? "#c9967a" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs">{currentPost.isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Delete — only show for post owner */}
          {user?.id === currentPost.author.id && (
            <button
              onClick={() => deletePost(currentPost.id)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] border border-[rgba(201,97,74,0.14)] bg-[rgba(255,240,235,0.45)] text-[#b05040] cursor-pointer transition-all duration-200 hover:bg-[rgba(201,97,74,0.10)] hover:border-[rgba(201,97,74,0.30)] hover:text-[#a04030]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </article>

      {/* ── Comment Modal ── */}
      {showComments && (
        <div
          className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-5"
          onClick={(e) => e.target === e.currentTarget && setShowComments(false)}
        >
          <div className="bg-[rgba(255,253,249,0.97)] backdrop-blur-[28px] rounded-[26px] border border-[rgba(201,150,122,0.18)] shadow-[0_28px_80px_rgba(28,25,23,0.18)] w-full max-w-[480px] max-h-[80vh] overflow-y-auto p-7 flex flex-col gap-5 modal-slide-up">

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

            {/* Reply indicator */}
            {replyTo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(201,150,122,0.08)] border border-[rgba(201,150,122,0.18)] text-[12.5px] text-[#a0614a]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
                  <polyline points="9 17 4 12 9 7" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                Replying to comment
                <button
                  onClick={() => { setReplyTo(null); setCommentText(""); }}
                  className="ml-auto text-[#a08070] hover:text-[#a0614a] underline underline-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Input row */}
            <div className="flex flex-col gap-2.5">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                placeholder={replyTo ? "Write a reply…" : "Write something kind… (⌘↵ to send)"}
                className="glass-input"
                rows={2}
              />
              <button onClick={submitComment} className="self-end btn-primary">
                {replyTo ? "Reply ✦" : "Send ✦"}
              </button>
            </div>

            {/* View all comments */}
            {currentPost.hasMoreComments && (
              <button
                onClick={() => fetchAllComments(currentPost.id)}
                className="text-[12.5px] text-[#a0614a] hover:underline underline-offset-2 self-start transition-colors"
              >
                View all {currentPost._count.comments} comments
              </button>
            )}

            {/* Divider */}
            <div className="h-px bg-[rgba(201,150,122,0.10)]" />

            {/* Comment list */}
            <div className="flex flex-col gap-5">
              {parentComments.length === 0 && (
                <p className="text-center text-[13px] text-[#a08070] italic py-4">
                  No comments yet — be the first ✦
                </p>
              )}

              {parentComments.map((comment) => {
                const username        = comment.user?.username ?? "User";
                const image           = comment.user?.image ?? null;
                const isCommentOwner  = user?.id === comment.user?.id;
                const isPostOwner     = user?.id === currentPost.author.id;
                const childReplies    = replies.filter((r) => r.parentId === comment.id);

                return (
                  <div key={comment.id} className="flex flex-col gap-2.5">

                    {/* Parent comment */}
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center">
                        {image ? (
                          <Image src={image} width={32} height={32} alt={username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">{username[0]?.toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="inline-flex flex-wrap gap-x-1.5 items-baseline">
                          <span className="font-display font-semibold text-[14px] text-[#1c1917]">{username}</span>
                          <span className="text-[13px] text-[#5a4a40] leading-relaxed">{comment.content}</span>
                        </div>

                        {comment.optimistic && (
                          <span className="text-[10px] text-[#a08070] italic ml-1">sending…</span>
                        )}

                        <div className="flex gap-3 mt-1.5">
                          <button
                            onClick={() => { setReplyTo(comment.id); setCommentText(`@${username} `); }}
                            className="text-[11.5px] text-[#a08070] hover:text-[#a0614a] transition-colors"
                          >
                            Reply
                          </button>
                          {(isCommentOwner || isPostOwner) && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-[11.5px] text-[#c05040] hover:text-[#a04030] transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {childReplies.length > 0 && (
                      <div className="flex flex-col gap-2 ml-10 pl-3 border-l-2 border-[rgba(201,150,122,0.15)]">
                        {childReplies.map((reply) => {
                          const rUser  = reply.user?.username ?? "User";
                          const rImage = reply.user?.image ?? null;

                          return (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[#e8d5c4] to-[#c9967a] flex items-center justify-center">
                                {rImage ? (
                                  <Image src={rImage} width={28} height={28} alt={rUser} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white font-bold text-xs">{rUser[0]?.toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-display font-semibold text-[13px] text-[#1c1917] mr-1.5">{rUser}</span>
                                <span className="text-[12.5px] text-[#5a4a40] leading-relaxed">{reply.content}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}