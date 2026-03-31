"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";

type Channel = {
  id: string;
  name: string;
  expiresAt: string;
};

export default function ChannelList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get("/channel");
        setChannels(res.data);
      } catch (err) {
        console.error("Failed to fetch channels");
      }
    };

    fetchChannels();

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(""), 3000);
    return () => clearTimeout(t);
  }, [info]);

  const createChannel = async () => {
    if (!name.trim()) return;

    setError("");
    setInfo("");

    try {
      const res = await api.post("/channel", { name });

      if (res.data.channel) {
        setInfo(res.data.message);
        onSelect(res.data.channel.id);
        return;
      }

      setChannels((prev) => [res.data, ...prev]);
      setName("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to create channel");
    }
  };

  return (
    <div className="w-[200px] sm:w-[260px] h-full border-r border-pink-200 flex flex-col ml-0 sm:ml-6 shrink-0">
      <div className="p-2 sm:p-3 border-b border-pink-200 flex flex-col gap-2">
        <div className="flex gap-1.5 sm:gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New channel..."
            className="flex-1 min-w-0 px-2 sm:px-3 py-2 rounded-lg text-[12px] sm:text-sm border border-pink-200 outline-none focus:ring-1 focus:ring-pink-400"
          />
          <button
            onClick={createChannel}
            className="px-2.5 sm:px-3 py-2 bg-[#E056A4] text-white rounded-lg text-sm hover:opacity-90 transition shrink-0"
          >
            +
          </button>
        </div>

        {info && (
          <p className="text-[11px] text-pink-500 bg-pink-50 border border-pink-200 px-2 py-1 rounded-lg">
            ℹ️ {info}
          </p>
        )}

        {error && <p className="text-[11px] text-red-400">⚠️ {error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 flex flex-col gap-1">
        {channels.length === 0 && (
          <p className="text-center text-pink-300 text-[12px] sm:text-sm mt-6">
            No channels yet
          </p>
        )}

        {channels.map((c) => {
          const timeLeft = new Date(c.expiresAt).getTime() - now;
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));

          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex justify-between items-center px-2 sm:px-3 py-2 rounded-lg text-[12px] sm:text-sm hover:bg-pink-100 transition text-pink-700"
            >
              <span className="truncate"># {c.name}</span>
              {hours <= 24 && hours >= 0 && (
                <span className="text-[10px] text-red-400 shrink-0 ml-1">{hours}h</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}