"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Users, FolderKanban } from "lucide-react";

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setWorkspace(d?.workspace || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId]);

  const handleNewWorkspaceProject = async () => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "blank",
        title: `${workspace?.name || "Studio"} Storyboard`,
        workspaceId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/app/editor/${data.project.id}`);
    }
  };

  if (loading) {
    return <div className="p-10 text-sm text-gray-500">Loading workspace...</div>;
  }

  if (!workspace) {
    return <div className="p-10 text-sm text-gray-500">Workspace not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl text-white font-bold flex items-center justify-center text-lg"
            style={{ backgroundColor: workspace.avatarColor || "#2563EB" }}
          >
            {workspace.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">
              {workspace.name}
            </h1>
            <p className="text-xs text-gray-500">
              {workspace.teamType} · {workspace.members?.length || 1} member(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/app/workspace/${workspaceId}/elements`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            @Elements
          </Link>
          <Link
            href={`/app/workspace/${workspaceId}/members`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <Users className="w-4 h-4" />
            Manage Members
          </Link>
          <button
            type="button"
            onClick={handleNewWorkspaceProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            New Workspace Storyboard
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-blue-600" />
          Workspace Storyboards
        </h2>

        {!workspace.projects || workspace.projects.length === 0 ? (
          <div className="p-10 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
            No storyboards in this workspace yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspace.projects.map((p: any) => (
              <Link
                key={p.id}
                href={`/app/editor/${p.id}`}
                className="p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition"
              >
                <div className="font-bold text-sm text-gray-900">{p.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {p.stages?.length || 1} shot(s)
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
