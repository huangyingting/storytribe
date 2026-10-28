"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AtSign, Plus, Trash2 } from "lucide-react";

export default function ElementsPage() {
  const [elements, setElements] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CHARACTER");
  const [description, setDescription] = useState("");

  const loadElements = useCallback(async () => {
    const res = await fetch(
      `/api/elements?category=${encodeURIComponent(categoryFilter)}`
    );
    if (res.ok) {
      const data = await res.json();
      setElements(data.elements || []);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadElements();
  }, [loadElements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/elements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category,
        description: description.trim(),
      }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      loadElements();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/elements/${id}`, { method: "DELETE" });
    if (res.ok) loadElements();
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <AtSign className="w-6 h-6 text-blue-600" />
          Elements Library (@Characters, @Props & @Backgrounds)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Create reusable story elements that can be referenced with @mentions in scripts,
          storyboards, and Tribe AI prompts.
        </p>
      </div>

      {/* Create Element Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
      >
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Element Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Barista Maya"
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="CHARACTER">Character</option>
            <option value="PROP">Prop</option>
            <option value="BACKGROUND">Background</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Visual Consistency Notes
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Orange apron, top bun..."
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New element
          </button>
        </div>
      </form>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        {["ALL", "CHARACTER", "PROP", "BACKGROUND"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold ${
              categoryFilter === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      {elements.length === 0 ? (
        <div className="p-10 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          No reusable @Elements saved yet. Create one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {elements.map((el) => (
            <div
              key={el.id}
              className="p-4 rounded-2xl border border-gray-200 bg-white flex items-start justify-between gap-3"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                  {el.handle}
                </span>
                <h3 className="mt-1.5 font-bold text-sm text-gray-900">
                  {el.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {el.description || el.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(el.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
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
