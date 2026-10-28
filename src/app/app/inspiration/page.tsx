"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Compass } from "lucide-react";

export default function InspirationPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/projects?scope=inspiration")
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setProjects(d.projects || []));
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : { savedItems: [] }))
      .then((d) =>
        setSavedIds((d.savedItems || []).map((item: any) => item.projectId))
      );
  }, []);

  const toggleSave = async (projectId: string) => {
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (res.ok) {
      const data = await res.json();
      setSavedIds((prev) =>
        data.saved ? [...prev, projectId] : prev.filter((id) => id !== projectId)
      );
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-600" />
          Community Inspiration
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Explore public storyboards shared by creators on StoryTribe.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          No public storyboards published yet. Enable public link access in the Share
          modal of any storyboard to feature it here!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    By {p.owner?.name || "Creator"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSave(p.id)}
                    className={`p-1.5 rounded-lg ${
                      savedIds.includes(p.id)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  href={p.shareToken ? `/share/${p.shareToken}` : `/app/editor/${p.id}`}
                  className="block mt-2 font-bold text-gray-900 hover:text-blue-600"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {p.synopsis || "Public storyboard"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
