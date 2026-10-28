"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";

const COLORS = ["#2563EB", "#9333EA", "#059669", "#EA580C", "#E11D48", "#18181B"];

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamType, setTeamType] = useState("STUDIO");
  const [avatarColor, setAvatarColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        teamType,
        avatarColor,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/app/workspace/${data.workspace.id}`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Set up a Studio Workspace
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Create a dedicated studio workspace to collaborate on storyboards, shared
          @Elements, and custom shot properties.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm"
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Workspace Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Horizon Creative Studio"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Team Type
          </label>
          <select
            value={teamType}
            onChange={(e) => setTeamType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="STUDIO">Film / Animation Studio</option>
            <option value="AGENCY">Creative / Ad Agency</option>
            <option value="PRODUCT">Product & UX Team</option>
            <option value="EDUCATION">Education / Classroom</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Avatar Accent Color
          </label>
          <div className="flex items-center gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`w-8 h-8 rounded-lg transition ${
                  avatarColor === c ? "ring-2 ring-offset-2 ring-gray-900" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this studio workspace working on?"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 inline-flex items-center justify-center gap-2"
        >
          {submitting ? "Creating Workspace..." : "Create Studio Workspace"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
