"use client";

import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

export default function ConnectionsPage() {
  const [data, setData] = useState<{
    following: any[];
    followers: any[];
    suggestedUsers: any[];
  }>({ following: [], followers: [], suggestedUsers: [] });

  const loadConnections = async () => {
    const res = await fetch("/api/connections");
    if (res.ok) {
      setData(await res.json());
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const toggleFollow = async (targetUserId: string) => {
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    loadConnections();
  };

  const followingIds = new Set(data.following.map((u) => u.id));

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Creator Connections
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Follow fellow directors, storyboard artists, and producers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">
            Following ({data.following.length})
          </h2>
          {data.following.length === 0 ? (
            <p className="text-xs text-gray-400">Not following anyone yet.</p>
          ) : (
            data.following.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-bold text-gray-900">{u.name}</div>
                  <div className="text-[11px] text-gray-500">@{u.username}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(u.id)}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold"
                >
                  Unfollow
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">
            Community Creators
          </h2>
          {data.suggestedUsers.length === 0 ? (
            <p className="text-xs text-gray-400">No other creators registered yet.</p>
          ) : (
            data.suggestedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-bold text-gray-900">{u.name}</div>
                  <div className="text-[11px] text-gray-500">
                    @{u.username} · {u.profession || "Creator"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(u.id)}
                  className="px-3 py-1 rounded-lg bg-gray-950 text-white text-xs font-bold"
                >
                  {followingIds.has(u.id) ? "Following" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
