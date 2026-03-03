"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";

interface Follower {
  id: string;
  name: string;
  image?: string | null;
}

export default function FollowersModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [followers, setFollowers] = useState<Follower[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get<Follower[]>(
        `/user/${userId}/followers`
      );
      setFollowers(data);
    };
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Followers</h2>

        {followers.map((f) => (
          <div key={f.id} className="flex items-center gap-3">
            {f.image && (
              <img
                src={f.image}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{f.name}</span>
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}