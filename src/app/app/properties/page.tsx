"use client";

import React, { useEffect, useState } from "react";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("select");
  const [category, setCategory] = useState("Camera & Lens");
  const [optionsText, setOptionsText] = useState("24mm, 35mm, 50mm, 85mm");
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Camera & Lens",
    "Lighting",
    "Audio",
    "Schedule",
    "Production",
    "Post",
    "Story & Script",
    "Uncategorised",
  ]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const loadProperties = async () => {
    const res = await fetch("/api/properties");
    if (res.ok) {
      const data = await res.json();
      setProperties(data.properties || []);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const options =
      type === "select" || type === "multiselect"
        ? optionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: label.trim(),
        type,
        category,
        options,
      }),
    });
    if (res.ok) {
      setLabel("");
      loadProperties();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) loadProperties();
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-blue-600" />
          Shot Properties Manager
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure custom metadata fields (Text, Select, Multi-select, Number, Checkbox,
          Person, Media) available across Storyboard Grid, Canvas, and Shot List Table.
        </p>
      </div>

      {/* Category Filter Pills & New Category Creator (upstream pages__app__properties) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeCategoryFilter === cat
                    ? "bg-gray-950 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setCategoryError(null);
              }}
              placeholder="New category..."
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = newCategoryName.trim();
                if (!trimmed) return;
                if (
                  categories.some(
                    (c) => c.toLowerCase() === trimmed.toLowerCase()
                  )
                ) {
                  setCategoryError("You already have a category with this name");
                  return;
                }
                setCategories((prev) => [...prev, trimmed]);
                setCategory(trimmed);
                setNewCategoryName("");
                setCategoryError(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50"
            >
              Create category
            </button>
          </div>
        </div>
        {categoryError && (
          <p className="text-xs text-red-600 font-semibold">{categoryError}</p>
        )}
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
      >
        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Property Name
          </label>
          <input
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Lens Focal Length"
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi-select</option>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox</option>
            <option value="person">Person</option>
            <option value="media">Media</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
          >
            {categories
              .filter((c) => c !== "All")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Options (comma-separated)
          </label>
          <input
            type="text"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            disabled={type !== "select" && type !== "multiselect"}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm disabled:bg-gray-50"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {properties
          .filter(
            (p) =>
              activeCategoryFilter === "All" ||
              p.category === activeCategoryFilter
          )
          .map((p) => (
          <div
            key={p.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">{p.label}</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-mono">
                  {p.type}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">
                  {p.category}
                </span>
              </div>
              {Array.isArray(p.options) && p.options.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.options.map((opt: string) => (
                    <span
                      key={opt}
                      className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!p.isDefault && (
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
