"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"lastUpdated" | "createdAt" | "titleAsc" | "titleDesc">("lastUpdated");
  const [movingProject, setMovingProject] = useState<any | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    const [projRes, wsRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/workspaces"),
    ]);
    if (projRes.ok) {
      const data = await projRes.json();
      setProjects(data.projects || []);
    }
    if (wsRes.ok) {
      const wsData = await wsRes.json();
      setWorkspaces(wsData.workspaces || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}/duplicate`, { method: "POST" });
    if (res.ok) loadProjects();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filtered = projects
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "createdAt") {
        return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime();
      }
      if (sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "titleDesc") {
        return b.title.localeCompare(a.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleMoveToWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingProject) return;
    await fetch(`/api/projects/${movingProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: targetWorkspaceId || null,
      }),
    });
    setMovingProject(null);
    loadProjects();
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            Projects
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage all your personal and workspace storyboard projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Sort by:</span>
            <select
              aria-label="Sort projects"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800"
            >
              <option value="lastUpdated">Last updated</option>
              <option value="createdAt">Date created</option>
              <option value="titleAsc">Title (A–Z)</option>
              <option value="titleDesc">Title (Z–A)</option>
            </select>
          </div>
          <Link
            href="/app/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400">
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <div className="text-sm font-bold text-gray-800">No projects found</div>
          <Link
            href="/app/create"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Create Storyboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <Link
              key={proj.id}
              href={`/app/editor/${proj.id}`}
              className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="h-36 bg-[#FFFBEB] border-b border-gray-100 flex items-center justify-center p-4">
                <span className="text-xs font-bold text-amber-900">
                  {proj.stages?.length || 1} Shot(s) · {proj.width}×{proj.height}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600">
                    {proj.title}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {proj.synopsis || "Storyboard project"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMovingProject(proj);
                        setTargetWorkspaceId(proj.workspaceId || "");
                      }}
                      title="Move to a workspace"
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Move to
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      title="Duplicate project"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(proj.id, e)}
                      title="Delete project"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {movingProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleMoveToWorkspace}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-base font-extrabold text-gray-950">
              Move {movingProject.title} to a workspace
            </h3>
            <select
              value={targetWorkspaceId}
              onChange={(e) => setTargetWorkspaceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option value="">Personal Projects (No workspace)</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMovingProject(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
              >
                Move
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
