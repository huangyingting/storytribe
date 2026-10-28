"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user || null));
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setProjects(d.projects || []));
  }, []);

  if (!user) {
    return <div className="p-10 text-sm text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white text-2xl font-extrabold flex items-center justify-center">
            {(user.name || user.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">{user.name}</h1>
            <p className="text-xs text-gray-500">
              @{user.username} · {user.profession || "Storyboard Creator"}
            </p>
            {user.bio && (
              <p className="mt-2 text-xs text-gray-600 max-w-xl">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.username && (
            <Link
              href={`/${user.username}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Public Profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/app/settings?tab=profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
          >
            <UserCircle className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">
          Your Storyboard Portfolio ({projects.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/app/editor/${p.id}`}
              className="p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition"
            >
              <div className="font-bold text-sm text-gray-900">{p.title}</div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {p.synopsis || "Storyboard project"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
