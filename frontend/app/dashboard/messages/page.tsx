"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/app/lib/axios"
import Image from "next/image"

type Conversation = {
  conversationId: string
  user: {
    id: string
    username: string
    image?: string
  }
  lastMessage?: {
    content: string
  } | null
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    const fetchChats = async () => {
      const res = await api.get("/message/conversations")
      setConversations(res.data)
    }

    fetchChats()
  }, [])

  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-4 sm:gap-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-black">
        Messages
      </h1>

      <div className="rounded-3xl overflow-hidden bg-[rgba(255,230,242,0.85)] border border-[rgba(224,86,164,0.25)] backdrop-blur-[20px]">
        {conversations.length === 0 && (
          <div className="py-12 sm:py-16 text-center text-pink-300">
            No conversations yet
          </div>
        )}

        {conversations.map((c) => (
          <Link
            key={c.conversationId}
            href={`/dashboard/messages/${c.conversationId}`}
          >
            <div
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b last:border-none cursor-pointer hover:bg-pink-100 transition"
              style={{ borderColor: "rgba(224,86,164,0.18)" }}
            >
              {c.user.image ? (
                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full overflow-hidden">
                  <Image
                    src={c.user.image}
                    width={44}
                    height={44}
                    alt={c.user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-gradient-to-r from-[#E056A4] to-[#ff7bbd] flex items-center justify-center text-white text-sm sm:text-base font-semibold">
                  {c.user.username[0].toUpperCase()}
                </div>
              )}

              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-[14px] sm:text-[15px] font-medium text-black truncate">
                  {c.user.username}
                </p>
                <p className="text-[12px] sm:text-sm text-gray-600 truncate">
                  {c.lastMessage?.content ?? "Start conversation"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}