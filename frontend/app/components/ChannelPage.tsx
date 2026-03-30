"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/app/lib/axios";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";

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

type Channel = {
  id: string;
  name: string;
  creator: {
    id: string;
    username: string;
  };
};

export default function ChannelPage({ channelId }: { channelId: string }) {
  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/channel/${channelId}`);
      setChannel(res.data);
      setMessages(res.data.messages);
    };

    fetchData();
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await api.post(`/channel/${channelId}/message`, { content: text });
    setText("");
  };

  const deleteMessage = async (id: string) => {
    await api.delete(`/channel/message/${id}`);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, content: "This message was deleted", isDeleted: true }
          : m
      )
    );
  };

  const blockUser = async (userId: string) => {
    await api.post(`/channel/${channelId}/block`, { userId });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(224,86,164,0.18)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E056A4] flex items-center justify-center text-white text-sm font-bold">
            #
          </div>
          <p className="text-[14px] font-semibold text-black tracking-tight">
            {channel?.name || "Channel"}
          </p>
        </div>

        <span className="text-[11px] text-pink-400">
          by {channel?.creator.username}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((m) => {
          const isMe = m.sender.id === user?.id;
          const isAdmin = channel?.creator.id === user?.id;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>

                {!isMe && (
                  m.sender.image ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={m.sender.image}
                        width={32}
                        height={32}
                        alt={m.sender.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E056A4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {m.sender.username[0].toUpperCase()}
                    </div>
                  )
                )}

                <div className="flex flex-col">
                  {!isMe && (
                    <p className="text-[11px] text-pink-400 mb-0.5 ml-1">
                      {m.sender.username}
                    </p>
                  )}

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
                          className="
                            px-3 py-1 rounded-lg text-[11px] font-medium
                            bg-white text-[#E056A4]
                            border border-[#E056A4]/30
                            shadow-sm
                            hover:bg-[#E056A4] hover:text-white
                            transition-all duration-200
                          "
                        >
                          Unsend
                        </button>
                      </div>
                    )}

                    {!isMe && isAdmin && !m.isDeleted && (
                      <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => blockUser(m.sender.id)}
                          className="
                            px-3 py-1 rounded-lg text-[11px] font-medium
                            bg-white text-red-400
                            border border-red-200
                            shadow-sm
                            hover:bg-red-400 hover:text-white
                            transition-all duration-200
                          "
                        >
                          Block
                        </button>
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] mt-1 ${isMe ? "text-right text-pink-300" : "text-gray-400"}`}>
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div
        className="p-4 flex gap-3 items-center"
        style={{ borderTop: "1px solid rgba(224,86,164,0.18)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-xl outline-none text-sm"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(224,86,164,0.3)",
          }}
        />

        <button
          onClick={sendMessage}
          className="
            px-5 py-2 rounded-xl text-sm font-medium
            bg-[#E056A4] text-white transition
            hover:bg-white hover:text-[#E056A4]
          "
          style={{ border: "1px solid #E056A4" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}