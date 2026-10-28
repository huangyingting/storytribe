"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";
import NotFound from "@/app/not-found";

export default function PublicCreatorProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username || "";
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
      setLoading(false);
    }
    if (username) load();
  }, [username]);

  if (loading) {
    return <div className="p-16 text-center text-sm text-gray-500">Loading creator profile...</div>;
  }

  if (!profile) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="p-8 rounded-2xl border border-gray-200 bg-[#FBF9F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-extrabold flex items-center justify-center">
              {(profile.name || profile.username || "C")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {profile.name}
              </h1>
              <p className="text-xs font-mono text-gray-500">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-gray-700 mt-2 max-w-xl">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-lg font-extrabold text-gray-900">
                {profile._count?.projects ?? 0}
              </div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gray-900">
                {profile._count?.followers ?? 0}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Public Storyboards
          </h2>
          {!profile.projects || profile.projects.length === 0 ? (
            <div className="p-8 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
              No public storyboards published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.projects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/share/${p.shareToken}`}
                  className="p-5 rounded-2xl border border-gray-200 hover:shadow-md transition block"
                >
                  <div className="font-bold text-gray-900">{p.title}</div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.synopsis || "Public storyboard project"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
