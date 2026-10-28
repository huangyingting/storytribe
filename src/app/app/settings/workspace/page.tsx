"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Settings, Users, ArrowRight } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : { workspaces: [] }))
      .then((d) => {
        setWorkspaces(d.workspaces || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5" />
            Settings · Workspace
          </div>
          <h1 className="text-2xl font-extrabold text-gray-950 mt-1">
            Workspace Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your studio workspaces, team member seats, and shared @Elements libraries.
          </p>
        </div>

        <Link
          href="/app/workspace/setup"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-xs font-bold">
        <Link
          href="/app/settings"
          className="px-3.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Account & Billing
        </Link>
        <span className="px-3.5 py-1.5 rounded-lg bg-gray-950 text-white">
          Workspace Settings
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500">Loading workspaces...</div>
      ) : workspaces.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
          <Building2 className="w-8 h-8 text-gray-400 mx-auto" />
          <div className="text-sm font-bold text-gray-900">
            No custom workspaces configured yet
          </div>
          <p className="text-xs text-gray-500">
            Create a team workspace to collaborate on storyboards and share @Elements.
          </p>
          <Link
            href="/app/workspace/setup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
          >
            Create Workspace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm"
                  style={{ backgroundColor: ws.avatarColor || "#2563EB" }}
                >
                  {ws.name?.[0]?.toUpperCase() || "W"}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-950">{ws.name}</div>
                  <div className="text-xs text-gray-500">
                    {ws.teamType || "STUDIO"} · {ws._count?.projects ?? ws.projects?.length ?? 0} storyboard(s)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/app/workspace/${ws.id}/elements`}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  @Elements
                </Link>
                <Link
                  href={`/app/workspace/${ws.id}/members`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  Members
                </Link>
                <Link
                  href={`/app/workspace/${ws.id}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
                >
                  Open
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
