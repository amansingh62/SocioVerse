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
    <div className="w-[260px] h-full border-r border-pink-200 flex flex-col ml-6">
      <div className="p-3 border-b border-pink-200 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New channel..."
            className="
              flex-1 px-3 py-2 rounded-lg text-sm
              border border-pink-200 outline-none
              focus:ring-1 focus:ring-pink-400
            "
          />

          <button
            onClick={createChannel}
            className="
              px-3 py-2 bg-[#E056A4] text-white rounded-lg text-sm
              hover:opacity-90 transition
            "
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

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {channels.length === 0 && (
          <p className="text-center text-pink-300 text-sm mt-6">
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
              className="
                flex justify-between items-center
                px-3 py-2 rounded-lg text-sm
                hover:bg-pink-100 transition
                text-pink-700
              "
            >
              <span># {c.name}</span>

              {hours <= 24 && hours >= 0 && (
                <span className="text-[10px] text-red-400">{hours}h</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
