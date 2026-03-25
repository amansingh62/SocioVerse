"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "../types/post";
import { usePostStore } from "../store/postStore";
import { useAuthStore } from "../store/authStore";
import Image from "next/image";

const C = {
  accent:     "#E91E8C",
  accentDeep: "#C2185B",
  accentPale: "#FCE4F1",
  accentGlow: "rgba(233,30,140,0.12)",
  pageBg:     "#FBE9F0",
  card:       "#FFFFFF",
  border:     "#F3D0E3",
  ink:        "#1C1C2E",
  inkMid:     "#555566",
  inkMuted:   "#AAAABC",
  font:       "'DM Sans', sans-serif",
  fontSerif:  "'DM Serif Display', Georgia, serif",
};

const AVATAR   = 46; 
const GAP      = 13; 

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [replyTo,      setReplyTo]      = useState<string | null>(null);
  const [taFocused,    setTaFocused]    = useState(false);

  const storePost   = usePostStore((s) => s.postsById[post.id]);
  const currentPost = storePost ?? post;

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
  const replies        = comments.filter((c) => !!c.parentId);

  return (
    <>
      <article style={{
        background:    C.card,
        borderRadius:  "20px",
        padding:       "22px 24px 18px",
        display:       "flex",
        flexDirection: "column",
        boxShadow:     "0 2px 16px rgba(233,30,140,0.07), 0 1px 3px rgba(0,0,0,0.04)",
      }}>

        {/* ── Author row ── */}
        <Link
          href={`/dashboard/profile/${currentPost.author.id}`}
          style={{ display:"flex", alignItems:"center", gap:`${GAP}px`, textDecoration:"none", marginBottom:"14px" }}
        >
          {/* Avatar — thin gradient ring */}
          <div style={{ position:"relative", flexShrink:0, width:`${AVATAR}px`, height:`${AVATAR}px` }}>
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:`linear-gradient(135deg, ${C.accent}, #FF8EC7)`,
              padding:"1.5px", display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <div style={{
                width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:C.accent, color:"#fff", fontWeight:700,
                fontSize:"16px", fontFamily:C.font, border:"2px solid #fff",
              }}>
                {currentPost.author.image ? (
                  <Image src={currentPost.author.image} width={AVATAR} height={AVATAR}
                    alt={currentPost.author.username}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  currentPost.author.username?.[0]?.toUpperCase()
                )}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
            <span style={{ fontFamily:C.fontSerif, fontSize:"15.5px", fontWeight:700, color:C.ink, letterSpacing:"-0.01em", lineHeight:1 }}>
              {currentPost.author.username}
            </span>
            <span style={{ fontFamily:C.font, fontSize:"12px", color:C.accent, fontWeight:500 }}>
              @{currentPost.author.username?.toLowerCase()}
            </span>
          </div>

          <div style={{
            marginLeft:"auto", padding:"4px 11px", borderRadius:"20px",
            background:C.accentPale, fontFamily:C.font, fontSize:"11px",
            fontWeight:600, color:C.accent, whiteSpace:"nowrap",
          }}>
            {currentPost.createdAt
              ? new Date(currentPost.createdAt).toLocaleDateString(undefined, { month:"short", day:"numeric" })
              : ""}
          </div>
        </Link>

        {/* ── Content — no left indent, full width ── */}
        {currentPost.content && (
          <p style={{
            fontFamily: C.font, fontSize:"14.5px", lineHeight:"1.85",
            color:C.inkMid, whiteSpace:"pre-line", margin:"0 0 16px 0",
          }}>
            {currentPost.content}
          </p>
        )}

        {/* ── Image ── */}
        {currentPost.mediaUrl && currentPost.mediaType === "IMAGE" && (
          <div style={{ borderRadius:"14px", overflow:"hidden", marginBottom:"16px", boxShadow:"0 4px 20px rgba(233,30,140,0.10)" }}>
            <Image src={currentPost.mediaUrl} width={600} height={400} alt="post media"
              style={{ width:"100%", maxHeight:"360px", objectFit:"cover", display:"block" }} />
          </div>
        )}

        {/* ── Video ── */}
        {currentPost.mediaUrl && currentPost.mediaType === "VIDEO" && (
          <div style={{ borderRadius:"14px", overflow:"hidden", marginBottom:"16px" }}>
            <video controls style={{ width:"100%", maxHeight:"360px", display:"block" }}>
              <source src={currentPost.mediaUrl} />
            </video>
          </div>
        )}

        {/* ── Action bar — left-aligned, no indent ── */}
        <div style={{ display:"flex", alignItems:"center", gap:"2px", marginLeft:"-8px" }}>

          {/* LIKE */}
          <button onClick={() => toggleLike(currentPost.id)} style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"7px 12px 7px 8px", borderRadius:"50px",
            border:"none", background:"transparent", cursor:"pointer",
          }}>
            <svg viewBox="0 0 24 24" width="21" height="21"
              fill={currentPost.isLiked ? C.accent : "none"}
              stroke={currentPost.isLiked ? C.accent : C.inkMuted}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontFamily:C.font, fontSize:"13px", fontWeight:600, color:currentPost.isLiked ? C.accent : C.inkMuted }}>
              {currentPost._count.likes}
            </span>
          </button>

          {/* COMMENT */}
          <button onClick={() => setShowComments(true)} style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"7px 12px 7px 8px", borderRadius:"50px",
            border:"none", background:"transparent", cursor:"pointer",
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke={C.inkMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontFamily:C.font, fontSize:"13px", fontWeight:600, color:C.inkMuted }}>
              {currentPost._count.comments}
            </span>
          </button>

          {/* SAVE */}
          <button onClick={() => toggleSave(currentPost.id)} style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"7px 12px 7px 8px", borderRadius:"50px",
            border:"none", background:"transparent", cursor:"pointer",
          }}>
            <svg viewBox="0 0 24 24" width="19" height="19"
              fill={currentPost.isSaved ? C.accent : "none"}
              stroke={currentPost.isSaved ? C.accent : C.inkMuted}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontFamily:C.font, fontSize:"13px", fontWeight:600, color:currentPost.isSaved ? C.accent : C.inkMuted }}>
              {currentPost.isSaved ? "Saved" : "Save"}
            </span>
          </button>

          {/* DELETE */}
          {user?.id === currentPost.author.id && (
            <button onClick={() => deletePost(currentPost.id)} style={{
              marginLeft:"auto", display:"flex", alignItems:"center", justifyContent:"center",
              width:"34px", height:"34px", borderRadius:"50%",
              border:"none", background:"transparent", cursor:"pointer",
              color:"rgba(220,50,50,0.35)",
            }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </article>

      {/* ══ COMMENT MODAL ══ */}
      {showComments && (
        <div style={{
          position:"fixed", inset:0, zIndex:50, display:"flex",
          alignItems:"center", justifyContent:"center", padding:"20px",
          background:"rgba(20,5,15,0.45)", backdropFilter:"blur(8px)",
        }}
          onClick={(e) => e.target === e.currentTarget && setShowComments(false)}
        >
          <div style={{
            width:"100%", maxWidth:"490px", maxHeight:"80vh", overflowY:"auto",
            display:"flex", flexDirection:"column", gap:"20px",
            padding:"30px", borderRadius:"24px", background:"#FFFFFF",
            boxShadow:"0 32px 80px rgba(20,5,15,0.18), 0 2px 12px rgba(233,30,140,0.10)",
            border:`1px solid ${C.border}`,
          }}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h2 style={{ fontFamily:C.fontSerif, fontSize:"22px", fontWeight:700, color:C.ink, margin:0, letterSpacing:"-0.02em" }}>Comments</h2>
              <button onClick={() => setShowComments(false)} style={{
                width:"34px", height:"34px", borderRadius:"50%", border:`1px solid ${C.border}`,
                background:"transparent", color:C.inkMuted, cursor:"pointer", fontSize:"14px",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
            </div>

            {replyTo && (
              <div style={{
                display:"flex", alignItems:"center", gap:"8px", padding:"9px 14px",
                borderRadius:"12px", background:C.accentPale, fontSize:"12.5px",
                color:C.accent, fontFamily:C.font, fontWeight:500,
              }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                Replying to comment
                <button onClick={() => { setReplyTo(null); setCommentText(""); }} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.accentDeep, fontFamily:C.font, fontSize:"12px", fontWeight:600 }}>Cancel</button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key==="Enter" && (e.metaKey||e.ctrlKey)) submitComment(); }}
                onFocus={() => setTaFocused(true)}
                onBlur={() => setTaFocused(false)}
                placeholder={replyTo ? "Write a reply…" : "Share your thoughts…"}
                rows={2}
                style={{
                  width:"100%", borderRadius:"14px", padding:"12px 16px", outline:"none",
                  resize:"none", fontSize:"13.5px", lineHeight:"1.65", fontFamily:C.font,
                  color:C.ink, background:C.pageBg,
                  border:`1.5px solid ${taFocused ? C.accent : C.border}`,
                  boxShadow: taFocused ? `0 0 0 4px ${C.accentGlow}` : "none",
                  transition:"border-color 0.2s, box-shadow 0.2s",
                  boxSizing:"border-box", caretColor:C.accent,
                }}
              />
              <button onClick={submitComment} style={{
                alignSelf:"flex-end", padding:"9px 22px", borderRadius:"50px",
                border:"none", background:C.accent, color:"#fff",
                fontSize:"13px", fontWeight:700, fontFamily:C.font,
                cursor:"pointer", letterSpacing:"0.02em",
                boxShadow:`0 4px 16px rgba(233,30,140,0.30)`,
              }}>
                {replyTo ? "Reply" : "Post"}
              </button>
            </div>

            {currentPost.hasMoreComments && (
              <button onClick={() => fetchAllComments(currentPost.id)} style={{
                background:"none", border:"none", cursor:"pointer", fontFamily:C.font,
                fontSize:"12.5px", color:C.accent, fontWeight:600, alignSelf:"flex-start",
                padding:0, textDecoration:"underline", textUnderlineOffset:"3px",
              }}>View all {currentPost._count.comments} comments</button>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {parentComments.length === 0 && (
                <p style={{ textAlign:"center", fontFamily:C.font, fontSize:"13.5px", color:C.inkMuted, padding:"24px 0", margin:0 }}>
                  No comments yet — be the first! 💬
                </p>
              )}

              {parentComments.map((comment) => {
                const username       = comment.user?.username ?? "User";
                const image          = comment.user?.image    ?? null;
                const isCommentOwner = user?.id === comment.user?.id;
                const isPostOwner    = user?.id === currentPost.author.id;
                const childReplies   = replies.filter((r) => r.parentId === comment.id);

                return (
                  <div key={comment.id} style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    <div style={{ display:"flex", gap:"11px" }}>
                      <div style={{ width:"34px", height:"34px", borderRadius:"50%", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:C.accent, color:"#fff", fontWeight:700, fontSize:"13px", fontFamily:C.font, border:`1.5px solid ${C.accentPale}` }}>
                        {image ? <Image src={image} width={34} height={34} alt={username} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : username[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ background:C.pageBg, borderRadius:"4px 16px 16px 16px", padding:"10px 14px", display:"inline-block", maxWidth:"100%" }}>
                          <span style={{ fontFamily:C.fontSerif, fontSize:"13.5px", fontWeight:700, color:C.ink, marginRight:"6px" }}>{username}</span>
                          <span style={{ fontFamily:C.font, fontSize:"13.5px", color:C.inkMid, lineHeight:"1.6" }}>{comment.content}</span>
                          {comment.optimistic && <span style={{ fontFamily:C.font, fontSize:"10px", color:C.inkMuted, marginLeft:"6px", fontStyle:"italic" }}>sending…</span>}
                        </div>
                        <div style={{ display:"flex", gap:"14px", marginTop:"5px", paddingLeft:"4px" }}>
                          <button onClick={() => { setReplyTo(comment.id); setCommentText(`@${username} `); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:C.font, fontSize:"12px", color:C.inkMuted, fontWeight:600, padding:0 }}>Reply</button>
                          {(isCommentOwner || isPostOwner) && (
                            <button onClick={() => deleteComment(comment.id)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:C.font, fontSize:"12px", color:"rgba(220,50,50,0.50)", fontWeight:600, padding:0 }}>Delete</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {childReplies.length > 0 && (
                      <div style={{ marginLeft:"45px", display:"flex", flexDirection:"column", gap:"8px" }}>
                        {childReplies.map((reply) => {
                          const rUser  = reply.user?.username ?? "User";
                          const rImage = reply.user?.image    ?? null;
                          return (
                            <div key={reply.id} style={{ display:"flex", gap:"8px" }}>
                              <div style={{ width:"28px", height:"28px", borderRadius:"50%", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:C.accentPale, color:C.accent, fontWeight:700, fontSize:"11px", fontFamily:C.font }}>
                                {rImage ? <Image src={rImage} width={28} height={28} alt={rUser} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : rUser[0]?.toUpperCase()}
                              </div>
                              <div style={{ background:C.pageBg, borderRadius:"4px 14px 14px 14px", padding:"8px 12px", flex:1 }}>
                                <span style={{ fontFamily:C.fontSerif, fontSize:"13px", fontWeight:700, color:C.ink, marginRight:"5px" }}>{rUser}</span>
                                <span style={{ fontFamily:C.font, fontSize:"13px", color:C.inkMid }}>{reply.content}</span>
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