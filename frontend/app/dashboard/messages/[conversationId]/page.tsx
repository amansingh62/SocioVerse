"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/app/lib/axios";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";
import { initSocket } from "@/app/lib/socket";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  sender: {
    id: string;
    username: string;
    image?: string;
  };
};

type Participant = {
  id: string;
  username: string;
  image?: string;
};

type RawParticipant = {
  id: string;
  userId: string;
  conversationId: string;
  user: Participant;
};

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Single consolidated socket effect
  useEffect(() => {
    if (!user || !conversationId) return;

    const socket = initSocket();
    if (!socket) return;

    socket.emit("join_conversation", conversationId);

    const handleMessage = (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleDelete = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: "This message was deleted", isDeleted: true }
            : m
        )
      );
    };

    socket.on("receive_message", handleMessage);
    socket.on("message_deleted", handleDelete);

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("receive_message", handleMessage);
      socket.off("message_deleted", handleDelete);
    };
  }, [user, conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/message/${conversationId}`);
        setMessages(res.data.messages);
        setParticipants(
          res.data.participants.map((p: RawParticipant) => p.user)
        );
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherUser = useMemo(() => {
    if (!user || !participants.length) return undefined;
    return participants.find((p) => p.id !== user.id);
  }, [participants, user]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await api.post("/message/send", {
        conversationId,
        content: text,
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await api.patch(`/message/${messageId}`);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-[640px] mx-auto flex flex-col h-[80vh]">
      <div
        className="flex flex-col flex-1 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,230,242,0.85)",
          border: "1px solid rgba(224,86,164,0.25)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: "1px solid rgba(224,86,164,0.18)" }}
        >
          {otherUser?.image ? (
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={otherUser.image}
                width={36}
                height={36}
                alt={otherUser.username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#E056A4] flex items-center justify-center text-white text-sm font-bold">
              {otherUser?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-[14px] font-semibold text-black tracking-tight">
              {otherUser?.username || "Chat"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-pink-300">Active now</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((m) => {
            const isMe = m.sender.id === user?.id;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${
                    isMe ? "flex-row-reverse" : ""
                  }`}
                >
                  {!isMe &&
                    (m.sender.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={m.sender.image}
                          width={32}
                          height={32}
                          alt={m.sender.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#E056A4] flex items-center justify-center text-white text-xs font-bold">
                        {m.sender.username[0].toUpperCase()}
                      </div>
                    ))}

                  <div className="flex flex-col">
                    <div
                      className="px-4 py-2 rounded-2xl text-sm relative group shadow-sm"
                      style={{
                        background: isMe ? "#E056A4" : "white",
                        color: isMe ? "white" : "black",
                      }}
                    >
                      {m.isDeleted ? (
                        <i className="text-gray-300">This message was deleted</i>
                      ) : (
                        m.content
                      )}

                      {isMe && !m.isDeleted && (
                        <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-medium bg-white text-[#E056A4] border border-[#E056A4]/30 shadow-sm hover:bg-[#E056A4] hover:text-white transition-all duration-200"
                          >
                            Unsend
                          </button>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] mt-1 ${
                        isMe ? "text-right text-pink-300" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="p-4 flex gap-3 items-center"
          style={{ borderTop: "1px solid rgba(224,86,164,0.18)" }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl outline-none text-sm"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(224,86,164,0.3)",
            }}
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-[#E056A4] text-white transition hover:bg-white hover:text-[#E056A4]"
            style={{ border: "1px solid #E056A4" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}