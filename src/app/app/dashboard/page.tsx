"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Sparkles,
  FileText,
  LayoutTemplate,
  FolderKanban,
  ArrowRight,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQuickCreate = async (mode: string) => {
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        title:
          mode === "ai-wizard"
            ? "AI Commercial Storyboard"
            : mode === "template"
            ? "Studio Production Storyboard"
            : "Untitled Storyboard",
        width: 1920,
        height: 1080,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/app/editor/${data.project.id}`);
    } else {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-10">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            Welcome back, {session?.user?.name || "Creator"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create storyboards, write scripts, and collaborate with your studio team.
          </p>
        </div>

        <button
          type="button"
          disabled={creating}
          onClick={() => handleQuickCreate("blank")}
          data-testid="dashboard-new-project-btn"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creating..." : "New Storyboard"}
        </button>
      </div>

      {/* Quick Start Cards matching StoryTribe Create flows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => handleQuickCreate("blank")}
          className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
            <Plus className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-gray-900">Blank Storyboard</div>
          <p className="text-xs text-gray-500 mt-1">
            Start from a clean 16:9 widescreen stage and build frame by frame.
          </p>
        </button>

        <button
          type="button"
          onClick={() => router.push("/app/create?tab=ai")}
          className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-purple-500 hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-gray-900">
            AI Script-to-Storyboard
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Describe your story concept and let Tribe AI generate scenes & shots.
          </p>
        </button>

        <button
          type="button"
          onClick={() => router.push("/app/create?tab=import")}
          className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500 hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-gray-900">Import Script</div>
          <p className="text-xs text-gray-500 mt-1">
            Paste or upload screenplay text (INT./EXT.) to auto-build shots.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleQuickCreate("template")}
          className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-amber-500 hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-gray-900">
            Production Template
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Start with pre-configured scenes, characters, and camera properties.
          </p>
        </button>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-gray-500" />
            Recent projects
          </h2>
          <Link
            href="/app/projects"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View all projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-3 bg-gray-50/50">
            <div className="font-bold text-gray-900">
              No storyboard projects yet
            </div>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Create your first storyboard above to start illustrating shots, writing
              scripts, and exporting production sheets.
            </p>
            <button
              type="button"
              onClick={() => handleQuickCreate("blank")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create First Storyboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((proj) => (
              <Link
                key={proj.id}
                href={`/app/editor/${proj.id}`}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="h-40 bg-[#FFFBEB] border-b border-gray-100 flex items-center justify-center p-4 relative">
                  <span className="text-xs font-bold text-amber-900/70">
                    {proj.stages?.length || 1} Shot(s) · {proj.width}×{proj.height}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {proj.synopsis || "Storyboard project"}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    Updated {new Date(proj.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Studio Workspace Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-950 to-gray-800 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
            <Users className="w-4 h-4" />
            Studio Collaboration
          </div>
          <h3 className="text-lg font-bold">Work on storyboards together</h3>
          <p className="text-xs text-gray-300">
            Create a shared Studio Workspace to organize team projects, @Elements, and
            custom shot properties.
          </p>
        </div>
        <Link
          href="/app/workspace/setup"
          className="px-4 py-2.5 rounded-xl bg-white text-gray-950 text-xs font-bold hover:bg-gray-100 transition shrink-0"
        >
          Create Workspace
        </Link>
      </div>
    </div>
  );
}
