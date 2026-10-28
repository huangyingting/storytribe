"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AtSign, Plus, Trash2, ArrowLeft, Users } from "lucide-react";

const ELEMENT_CATEGORIES = ["ALL", "CHARACTER", "PROP", "BACKGROUND"] as const;

export default function WorkspaceElementsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CHARACTER");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    const [wsRes, elRes] = await Promise.all([
      fetch(`/api/workspaces/${workspaceId}`),
      fetch(`/api/elements?workspaceId=${encodeURIComponent(workspaceId)}`),
    ]);
    if (wsRes.ok) {
      const wsData = await wsRes.json();
      setWorkspace(wsData.workspace);
    }
    if (elRes.ok) {
      const elData = await elRes.json();
      setElements(elData.elements || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/elements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        name: name.trim(),
        category,
        description: description.trim(),
      }),
    });
    setCreating(false);
    if (res.ok) {
      setName("");
      setDescription("");
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/elements?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    loadData();
  };

  const filtered = elements.filter((el) =>
    activeCategory === "ALL" ? true : el.category === activeCategory
  );

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/app/workspace/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {workspace?.name || "Workspace"}
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
            <AtSign className="w-6 h-6 text-blue-600" />
            {workspace?.name || "Workspace"} · @Elements Library
          </h1>
          <p className="text-xs text-gray-500">
            Shared characters, props, and backdrops across all storyboards in this studio workspace.
          </p>
        </div>

        <Link
          href={`/app/workspace/${workspaceId}/members`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
        >
          <Users className="w-4 h-4" />
          Workspace Members
        </Link>
      </div>

      <form
        onSubmit={handleCreate}
        className="p-5 rounded-2xl border border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            Element Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya (Lead Barista)"
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            <option value="CHARACTER">Character</option>
            <option value="PROP">Prop</option>
            <option value="BACKGROUND">Backdrop / Location</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            Visual Notes
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Apron, warm smile, curly hair"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Workspace @Element
        </button>
      </form>

      <div className="flex items-center gap-2">
        {ELEMENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeCategory === cat
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
          No workspace @Elements in this category yet. Create one above to share across team storyboards.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((el) => (
            <div
              key={el.id}
              className="p-4 rounded-2xl border border-gray-200 bg-white flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {el.handle}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    {el.category}
                  </span>
                </div>
                <div className="font-bold text-sm text-gray-900">{el.name}</div>
                {el.description && (
                  <p className="text-xs text-gray-500">{el.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(el.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Delete element"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
