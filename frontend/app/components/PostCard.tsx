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

  const storePost    = usePostStore((s) => s.postsById[post.id]);
  const currentPost  = storePost ?? post;

  const toggleLike       = usePostStore((s) => s.toggleLike);
  const toggleSave       = usePostStore((s) => s.toggleSave);
  const deletePost       = usePostStore((s) => s.deletePost);
  const addComment       = usePostStore((s) => s.addComment);
  const fetchAllComments = usePostStore((s) => s.fetchAllComments);
  const deleteComment    = usePostStore((s) => s.deleteComment);

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
      <article
        className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 group"
        style={{
          background: "rgba(16,9,28,0.62)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.13)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.border = "1px solid rgba(139,92,246,0.28)";
          (e.currentTarget as HTMLElement).style.background = "rgba(22,12,40,0.72)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.border = "1px solid rgba(139,92,246,0.13)";
          (e.currentTarget as HTMLElement).style.background = "rgba(16,9,28,0.62)";
        }}
      >
        {/* ── Author ── */}
        <Link
          href={`/dashboard/profile/${currentPost.author.id}`}
          className="flex items-center gap-3 no-underline"
          style={{ textDecoration: "none" }}
        >
          <div
            className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              border: "2px solid rgba(139,92,246,0.32)",
              boxShadow: "0 2px 12px rgba(124,58,237,0.22)",
            }}
          >
            {currentPost.author.image ? (
              <Image
                src={currentPost.author.image}
                width={44}
                height={44}
                alt={currentPost.author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              currentPost.author.username?.[0]?.toUpperCase()
            )}
          </div>

          <div>
            <p
              className="text-[15px] font-semibold leading-none transition-colors duration-200"
              style={{
                fontFamily: "Syne, sans-serif",
                color: "rgba(237,233,254,0.92)",
              }}
            >
              {currentPost.author.username}
            </p>
            <p className="text-[11.5px] mt-0.5" style={{ color: "rgba(139,92,246,0.55)" }}>
              @{currentPost.author.username?.toLowerCase()}
            </p>
          </div>

          {/* Timestamp — right aligned */}
          <span className="ml-auto text-[11px]" style={{ color: "rgba(139,92,246,0.35)", fontFamily: "DM Sans, sans-serif" }}>
            {currentPost.createdAt
              ? new Date(currentPost.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : ""}
          </span>
        </Link>

        {/* ── Content ── */}
        {currentPost.content && (
          <p
            className="text-[13.5px] leading-[1.78] whitespace-pre-line"
            style={{ color: "rgba(221,214,254,0.82)", fontFamily: "DM Sans, sans-serif" }}
          >
            {currentPost.content}
          </p>
        )}

        {/* ── Image ── */}
        {currentPost.mediaUrl && currentPost.mediaType === "IMAGE" && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(139,92,246,0.12)" }}
          >
            <Image
              src={currentPost.mediaUrl}
              width={600}
              height={400}
              alt="post media"
              className="w-full max-h-[340px] object-cover block"
            />
          </div>
        )}

        {/* ── Video ── */}
        {currentPost.mediaUrl && currentPost.mediaType === "VIDEO" && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(139,92,246,0.12)" }}
          >
            <video controls className="w-full max-h-[340px]">
              <source src={currentPost.mediaUrl} />
            </video>
          </div>
        )}

        {/* ── Action bar ── */}
        <div
          className="flex items-center gap-2 pt-3"
          style={{ borderTop: "1px solid rgba(139,92,246,0.09)" }}
        >
          {/* Like */}
          <ActionBtn
            active={currentPost.isLiked}
            onClick={() => toggleLike(currentPost.id)}
            activeColor="#f472b6"
            activeBorder="rgba(244,114,182,0.30)"
          >
            <span className="text-[16px] leading-none select-none">
              {currentPost.isLiked ? "♥" : "♡"}
            </span>
            <span>{currentPost._count.likes}</span>
          </ActionBtn>

          {/* Comment */}
          <ActionBtn onClick={() => setShowComments(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{currentPost._count.comments}</span>
          </ActionBtn>

          {/* Save */}
          <ActionBtn
            active={currentPost.isSaved}
            onClick={() => toggleSave(currentPost.id)}
            activeColor="#a78bfa"
            activeBorder="rgba(167,139,250,0.30)"
          >
            <svg
              viewBox="0 0 24 24"
              fill={currentPost.isSaved ? "#a78bfa" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs">{currentPost.isSaved ? "Saved" : "Save"}</span>
          </ActionBtn>

          {/* Delete — owner only */}
          {user?.id === currentPost.author.id && (
            <button
              onClick={() => deletePost(currentPost.id)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12.5px] transition-all duration-200 cursor-pointer"
              style={{
                border: "1px solid rgba(239,68,68,0.18)",
                background: "rgba(239,68,68,0.06)",
                color: "rgba(252,165,165,0.7)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.35)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.18)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(252,165,165,0.7)";
              }}
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

      {/* ══════════════════ COMMENT MODAL ══════════════════ */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(4,2,10,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowComments(false)}
        >
          <div
            className="w-full max-w-[500px] max-h-[82vh] overflow-y-auto flex flex-col gap-5 p-7 rounded-[24px] no-scrollbar"
            style={{
              background: "rgba(14,8,26,0.97)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(139,92,246,0.22)",
              boxShadow: "0 32px 80px rgba(4,2,10,0.70)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2
                className="text-[20px] font-bold"
                style={{ fontFamily: "Syne, sans-serif", color: "#ede9fe" }}
              >
                Comments
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                style={{
                  border: "1px solid rgba(139,92,246,0.22)",
                  color: "rgba(167,139,250,0.6)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.6)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Reply indicator */}
            {replyTo && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px]"
                style={{
                  background: "rgba(139,92,246,0.10)",
                  border: "1px solid rgba(139,92,246,0.22)",
                  color: "#a78bfa",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
                  <polyline points="9 17 4 12 9 7" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                Replying to comment
                <button
                  onClick={() => { setReplyTo(null); setCommentText(""); }}
                  className="ml-auto underline underline-offset-2 transition-colors"
                  style={{ color: "rgba(167,139,250,0.6)" }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="flex flex-col gap-2.5">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                placeholder={replyTo ? "Write a reply…" : "Write something… (⌘↵ to send)"}
                rows={2}
                className="w-full rounded-xl px-4 py-3 outline-none resize-none text-[13.5px] leading-relaxed transition-all duration-200"
                style={{
                  background: "rgba(139,92,246,0.07)",
                  border: "1px solid rgba(139,92,246,0.20)",
                  color: "#ede9fe",
                  fontFamily: "DM Sans, sans-serif",
                  caretColor: "#a855f7",
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(139,92,246,0.45)"; }}
                onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(139,92,246,0.20)"; }}
              />
              <button
                onClick={submitComment}
                className="self-end px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  border: "1px solid rgba(168,85,247,0.40)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.30)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#6d28d9,#9333ea)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#7c3aed,#a855f7)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {replyTo ? "Reply ◆" : "Send ◆"}
              </button>
            </div>

            {/* View all */}
            {currentPost.hasMoreComments && (
              <button
                onClick={() => fetchAllComments(currentPost.id)}
                className="text-[12.5px] self-start underline-offset-2 transition-colors"
                style={{ color: "#a78bfa" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa"; }}
              >
                View all {currentPost._count.comments} comments
              </button>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(139,92,246,0.10)" }} />

            {/* Comment list */}
            <div className="flex flex-col gap-5">
              {parentComments.length === 0 && (
                <p
                  className="text-center text-[13px] italic py-6"
                  style={{ color: "rgba(139,92,246,0.45)" }}
                >
                  No comments yet — be the first ◆
                </p>
              )}

              {parentComments.map((comment) => {
                const username       = comment.user?.username ?? "User";
                const image          = comment.user?.image ?? null;
                const isCommentOwner = user?.id === comment.user?.id;
                const isPostOwner    = user?.id === currentPost.author.id;
                const childReplies   = replies.filter((r) => r.parentId === comment.id);

                return (
                  <div key={comment.id} className="flex flex-col gap-2.5">
                    {/* Parent comment */}
                    <div className="flex gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[12px] overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                          border: "1.5px solid rgba(139,92,246,0.30)",
                        }}
                      >
                        {image
                          ? <Image src={image} width={32} height={32} alt={username} className="w-full h-full object-cover" />
                          : username[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="inline-flex flex-wrap gap-x-1.5 items-baseline">
                          <span
                            className="font-semibold text-[13.5px]"
                            style={{ fontFamily: "Syne, sans-serif", color: "#e9d5ff" }}
                          >
                            {username}
                          </span>
                          <span
                            className="text-[13px] leading-relaxed"
                            style={{ color: "rgba(221,214,254,0.75)", fontFamily: "DM Sans, sans-serif" }}
                          >
                            {comment.content}
                          </span>
                        </div>

                        {comment.optimistic && (
                          <span className="text-[10px] italic ml-1" style={{ color: "rgba(139,92,246,0.45)" }}>
                            sending…
                          </span>
                        )}

                        <div className="flex gap-3 mt-1.5">
                          <button
                            onClick={() => { setReplyTo(comment.id); setCommentText(`@${username} `); }}
                            className="text-[11.5px] transition-colors"
                            style={{ color: "rgba(139,92,246,0.50)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(139,92,246,0.50)"; }}
                          >
                            Reply
                          </button>
                          {(isCommentOwner || isPostOwner) && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-[11.5px] transition-colors"
                              style={{ color: "rgba(239,68,68,0.55)" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(239,68,68,0.55)"; }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {childReplies.length > 0 && (
                      <div
                        className="flex flex-col gap-2 ml-10 pl-3"
                        style={{ borderLeft: "2px solid rgba(139,92,246,0.15)" }}
                      >
                        {childReplies.map((reply) => {
                          const rUser  = reply.user?.username ?? "User";
                          const rImage = reply.user?.image ?? null;
                          return (
                            <div key={reply.id} className="flex gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[11px] overflow-hidden"
                                style={{
                                  background: "linear-gradient(135deg,#6d28d9,#a855f7)",
                                  border: "1.5px solid rgba(139,92,246,0.28)",
                                }}
                              >
                                {rImage
                                  ? <Image src={rImage} width={28} height={28} alt={rUser} className="w-full h-full object-cover" />
                                  : rUser[0]?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span
                                  className="font-semibold text-[13px] mr-1.5"
                                  style={{ fontFamily: "Syne, sans-serif", color: "#e9d5ff" }}
                                >
                                  {rUser}
                                </span>
                                <span
                                  className="text-[12.5px] leading-relaxed"
                                  style={{ color: "rgba(221,214,254,0.72)", fontFamily: "DM Sans, sans-serif" }}
                                >
                                  {reply.content}
                                </span>
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

/* ── Reusable action button ── */
function ActionBtn({
  children,
  onClick,
  active = false,
  activeColor = "#a78bfa",
  activeBorder = "rgba(167,139,250,0.30)",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  activeBorder?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12.5px] font-medium transition-all duration-200 cursor-pointer"
      style={{
        border: active ? `1px solid ${activeBorder}` : "1px solid rgba(139,92,246,0.14)",
        background: active ? `${activeColor}14` : "transparent",
        color: active ? activeColor : "rgba(167,139,250,0.65)",
        fontFamily: "DM Sans, sans-serif",
      }}
      onMouseEnter={(e) => {
        if (active) return;
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.10)";
        (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.28)";
      }}
      onMouseLeave={(e) => {
        if (active) return;
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.65)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.14)";
      }}
    >
      {children}
    </button>
  );
}