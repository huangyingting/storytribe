"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";

export default function WorkspaceMembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add member.");
      return;
    }
    setEmail("");
    loadMembers();
  };

  const handleRemove = async (memberId: string) => {
    await fetch(
      `/api/workspaces/${workspaceId}/members?memberId=${encodeURIComponent(memberId)}`,
      { method: "DELETE" }
    );
    loadMembers();
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/app/workspace/${workspaceId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspace
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-950">
        Workspace Team Members
      </h1>

      <form
        onSubmit={handleAddMember}
        className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Registered User Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@studio.com"
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 inline-flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold text-sm text-gray-900">
                {m.user?.name || m.user?.email}
              </div>
              <div className="text-xs text-gray-500">{m.user?.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {m.role}
              </span>
              {m.role !== "OWNER" && (
                <button
                  type="button"
                  onClick={() => handleRemove(m.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
