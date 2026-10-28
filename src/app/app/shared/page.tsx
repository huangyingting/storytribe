"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

export default function SharedProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?scope=shared")
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Shared with me
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Storyboards shared with your account by other StoryTribe creators.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400">
          Loading shared projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          No storyboards have been shared with you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/app/editor/${proj.id}`}
              className="p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition block"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>By {proj.owner?.name || proj.owner?.email}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {proj.guestPermission}
                </span>
              </div>
              <div className="font-bold text-gray-900">{proj.title}</div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {proj.synopsis || "Shared storyboard"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
