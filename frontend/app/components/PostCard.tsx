"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "../types/post";
import { usePostStore } from "../store/postStore";
import { useAuthStore } from "../store/authStore";
import Image from "next/image";

const AVATAR = 46;

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [taFocused, setTaFocused] = useState(false);

  const storePost = usePostStore((s) => s.postsById[post.id]);
  const currentPost = storePost ?? post;

  const toggleLike = usePostStore((s) => s.toggleLike);
  const toggleSave = usePostStore((s) => s.toggleSave);
  const deletePost = usePostStore((s) => s.deletePost);
  const addComment = usePostStore((s) => s.addComment);
  const fetchAllComments = usePostStore((s) => s.fetchAllComments);
  const deleteComment = usePostStore((s) => s.deleteComment);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(currentPost.id, commentText);
    setCommentText("");
  };

  const comments = currentPost.comments ?? [];

  return (
    <>
      <article className="bg-white rounded-[20px] px-6 pt-[22px] pb-[18px] flex flex-col shadow-[0_2px_16px_rgba(233,30,140,0.07),0_1px_3px_rgba(0,0,0,0.04)]">
        <Link
          href={`/dashboard/profile/${currentPost.author.id}`}
          className="flex items-center gap-[13px] no-underline mb-[14px]"
        >
          <div
            className="relative shrink-0"
            style={{ width: AVATAR, height: AVATAR }}
          >
            <div
              className="absolute inset-0 rounded-full p-[1.5px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #E91E8C, #FF8EC7)",
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#E91E8C] text-white font-bold text-[16px] border-2 border-white font-[DM_Sans,sans-serif]">
                {currentPost.author.image ? (
                  <Image
                    src={currentPost.author.image}
                    width={AVATAR}
                    height={AVATAR}
                    alt={currentPost.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentPost.author.username?.[0]?.toUpperCase()
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[3px]">
            <span className="font-[DM_Serif_Display,Georgia,serif] text-[15.5px] font-bold text-[#1C1C2E] tracking-[-0.01em] leading-none">
              {currentPost.author.username}
            </span>
            <span className="font-[DM_Sans,sans-serif] text-[12px] text-[#E91E8C] font-medium">
              @{currentPost.author.username?.toLowerCase()}
            </span>
          </div>

          <div className="ml-auto px-[11px] py-1 rounded-[20px] bg-[#FCE4F1] font-[DM_Sans,sans-serif] text-[11px] font-semibold text-[#E91E8C] whitespace-nowrap">
            {currentPost.createdAt
              ? new Date(currentPost.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </div>
        </Link>

        {currentPost.content && (
          <p className="font-[DM_Sans,sans-serif] text-[14.5px] leading-[1.85] text-[#555566] whitespace-pre-line m-0 mb-4">
            {currentPost.content}
          </p>
        )}

        {currentPost.mediaUrl && currentPost.mediaType === "IMAGE" && (
          <div className="rounded-[14px] overflow-hidden mb-4 shadow-[0_4px_20px_rgba(233,30,140,0.10)]">
            <Image
              src={currentPost.mediaUrl}
              width={600}
              height={400}
              alt="post media"
              className="w-full max-h-[360px] object-cover block"
            />
          </div>
        )}

        {currentPost.mediaUrl && currentPost.mediaType === "VIDEO" && (
          <div className="rounded-[14px] overflow-hidden mb-4">
            <video controls className="w-full max-h-[360px] block">
              <source src={currentPost.mediaUrl} />
            </video>
          </div>
        )}

        <div className="flex items-center gap-0.5 -ml-2">
          <button
            onClick={() => toggleLike(currentPost.id)}
            className="flex items-center gap-[6px] py-[7px] pr-3 pl-2 rounded-full border-none bg-transparent cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill={currentPost.isLiked ? "#E91E8C" : "none"}
              stroke={currentPost.isLiked ? "#E91E8C" : "#AAAABC"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span
              className={`font-[DM_Sans,sans-serif] text-[13px] font-semibold ${currentPost.isLiked ? "text-[#E91E8C]" : "text-[#AAAABC]"}`}
            >
              {currentPost._count.likes}
            </span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-[6px] py-[7px] pr-3 pl-2 rounded-full border-none bg-transparent cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="#AAAABC"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-[DM_Sans,sans-serif] text-[13px] font-semibold text-[#AAAABC]">
              {currentPost._count.comments}
            </span>
          </button>

          <button
            onClick={() => toggleSave(currentPost.id)}
            className="flex items-center gap-[6px] py-[7px] pr-3 pl-2 rounded-full border-none bg-transparent cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill={currentPost.isSaved ? "#E91E8C" : "none"}
              stroke={currentPost.isSaved ? "#E91E8C" : "#AAAABC"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span
              className={`font-[DM_Sans,sans-serif] text-[13px] font-semibold ${currentPost.isSaved ? "text-[#E91E8C]" : "text-[#AAAABC]"}`}
            >
              {currentPost.isSaved ? "Saved" : "Save"}
            </span>
          </button>

          {user?.id === currentPost.author.id && (
            <button
              onClick={() => deletePost(currentPost.id)}
              className="ml-auto flex items-center justify-center w-[34px] h-[34px] rounded-full border-none bg-transparent cursor-pointer text-red-400/40"
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </article>

      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[rgba(20,5,15,0.45)] backdrop-blur-[8px]"
          onClick={(e) =>
            e.target === e.currentTarget && setShowComments(false)
          }
        >
          <div className="w-full max-w-[490px] max-h-[80vh] overflow-y-auto flex flex-col gap-5 p-[30px] rounded-[24px] bg-white border border-[#F3D0E3] shadow-[0_32px_80px_rgba(20,5,15,0.18),0_2px_12px_rgba(233,30,140,0.10)]">
            <div className="flex items-center justify-between">
              <h2 className="font-[DM_Serif_Display,Georgia,serif] text-[22px] font-bold text-[#1C1C2E] m-0 tracking-[-0.02em]">
                Comments
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="w-[34px] h-[34px] rounded-full border border-[#F3D0E3] bg-transparent text-[#AAAABC] cursor-pointer text-[14px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-[10px]">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    submitComment();
                }}
                onFocus={() => setTaFocused(true)}
                onBlur={() => setTaFocused(false)}
                placeholder="Share your thoughts…"
                rows={2}
                className={`w-full rounded-[14px] px-4 py-3 outline-none resize-none text-[13.5px] leading-[1.65] font-[DM_Sans,sans-serif] text-[#1C1C2E] bg-[#FBE9F0] caret-[#E91E8C] box-border transition-[border-color,box-shadow] duration-200
                  ${
                    taFocused
                      ? "border-[1.5px] border-[#E91E8C] shadow-[0_0_0_4px_rgba(233,30,140,0.12)]"
                      : "border-[1.5px] border-[#F3D0E3] shadow-none"
                  }`}
              />
              <button
                onClick={submitComment}
                className="self-end px-[22px] py-[9px] rounded-full border-none bg-[#E91E8C] text-white text-[13px] font-bold font-[DM_Sans,sans-serif] cursor-pointer tracking-[0.02em] shadow-[0_4px_16px_rgba(233,30,140,0.30)]"
              >
                Post
              </button>
            </div>

            {currentPost.hasMoreComments && (
              <button
                onClick={() => fetchAllComments(currentPost.id)}
                className="bg-none border-none cursor-pointer font-[DM_Sans,sans-serif] text-[12.5px] text-[#E91E8C] font-semibold self-start p-0 underline underline-offset-[3px]"
              >
                View all {currentPost._count.comments} comments
              </button>
            )}

            <div className="flex flex-col gap-4">
              {comments.length === 0 && (
                <p className="text-center font-[DM_Sans,sans-serif] text-[13.5px] text-[#AAAABC] py-6 m-0">
                  No comments yet — be the first! 💬
                </p>
              )}

              {comments.map((comment) => {
                const username = comment.user?.username ?? "User";
                const image = comment.user?.image ?? null;
                const isCommentOwner = user?.id === comment.user?.id;
                const isPostOwner = user?.id === currentPost.author.id;

                return (
                  <div key={comment.id} className="flex gap-[11px]">
                    <div className="w-[34px] h-[34px] rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-[#E91E8C] text-white font-bold text-[13px] font-[DM_Sans,sans-serif] border-[1.5px] border-[#FCE4F1]">
                      {image ? (
                        <Image
                          src={image}
                          width={34}
                          height={34}
                          alt={username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        username[0]?.toUpperCase()
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="bg-[#FBE9F0] rounded-[4px_16px_16px_16px] px-[14px] py-[10px] inline-block max-w-full">
                        <span className="font-[DM_Serif_Display,Georgia,serif] text-[13.5px] font-bold text-[#1C1C2E] mr-[6px]">
                          {username}
                        </span>
                        <span className="font-[DM_Sans,sans-serif] text-[13.5px] text-[#555566] leading-[1.6]">
                          {comment.content}
                        </span>
                        {comment.optimistic && (
                          <span className="font-[DM_Sans,sans-serif] text-[10px] text-[#AAAABC] ml-[6px] italic">
                            sending…
                          </span>
                        )}
                      </div>

                      {(isCommentOwner || isPostOwner) && (
                        <div className="mt-[5px] pl-1">
                          <button
                            onClick={() =>
                              deleteComment(comment.id, currentPost.id)
                            }
                            className="bg-none border-none cursor-pointer font-[DM_Sans,sans-serif] text-[12px] text-red-400/50 font-semibold p-0"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
