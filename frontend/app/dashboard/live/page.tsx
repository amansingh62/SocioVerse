"use client";

import { useState } from "react";
import ChannelList from "@/app/components/ChannelList";
import ChannelPage from "@/app/components/ChannelPage";

export default function LivePage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  return (
    <div className="flex h-[80vh] max-w-[1000px] mx-auto rounded-3xl overflow-hidden">

      <ChannelList onSelect={setSelectedChannel} />

      <div className="flex-1">
        {selectedChannel ? (
          <ChannelPage channelId={selectedChannel} />
        ) : (
          <div className="h-full flex items-center justify-center text-pink-300">
            Select a channel to start chatting
          </div>
        )}
      </div>

    </div>
  );
}