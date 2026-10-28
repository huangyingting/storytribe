"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { VISUAL_STYLES } from "@/lib/catalog/storytribe-assets";
import { Sparkles, AtSign, Plus, Film, Palette } from "lucide-react";

const COVER_PALETTES = [
  { id: "aura-warm", label: "Warm Aura", gradient: "from-amber-200 via-orange-100 to-rose-200" },
  { id: "cinema-noir", label: "Cinema Noir", gradient: "from-slate-900 via-gray-800 to-zinc-900 text-white" },
  { id: "ocean-breeze", label: "Ocean Breeze", gradient: "from-cyan-200 via-sky-100 to-blue-200" },
  { id: "sunset-film", label: "Sunset Film", gradient: "from-rose-300 via-amber-200 to-yellow-100" },
  { id: "forest-sage", label: "Forest Sage", gradient: "from-emerald-200 via-teal-100 to-lime-100" },
  { id: "lavender-dream", label: "Lavender", gradient: "from-purple-200 via-fuchsia-100 to-indigo-200" },
];

export function StoryBibleMode() {
  const { project, updateProjectMeta, setViewMode } = useEditor();
  const [generatingSynopsis, setGeneratingSynopsis] = useState(false);
  const [newElName, setNewElName] = useState("");
  const [newElCategory, setNewElCategory] = useState<
    "CHARACTER" | "PROP" | "BACKGROUND"
  >("CHARACTER");

  const activePalette =
    COVER_PALETTES.find((p) => p.id === (project.coverPalette || "aura-warm")) ||
    COVER_PALETTES[0];

  const handleAutoSynopsis = async () => {
    setGeneratingSynopsis(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          generationType: "SYNOPSIS",
          prompt: project.title,
          style: project.visualStyle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.synopsis) {
          updateProjectMeta({ synopsis: data.synopsis });
        }
      }
    } finally {
      setGeneratingSynopsis(false);
    }
  };

  const handleAddElement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElName.trim()) return;
    const res = await fetch("/api/elements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newElName.trim(),
        category: newElCategory,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      updateProjectMeta({
        elements: [data.element, ...(project.elements || [])],
      });
      setNewElName("");
    }
  };

  const sceneCount = new Set(project.stages.map((s) => s.sceneNumber || 1)).size;

  return (
    <div
      data-testid="editor-mode-story-bible"
      className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8"
    >
      {/* Cover Banner with Palette Switcher matching 25-editor-story-bible-view.png */}
      <div
        data-testid="story-bible-cover-banner"
        className={`rounded-3xl bg-gradient-to-r ${activePalette.gradient} p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-end justify-between gap-4 min-h-[150px]`}
      >
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/80 text-gray-900 text-[10px] font-extrabold uppercase tracking-wider">
            Story Bible Cover
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            {project.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-white/85 backdrop-blur px-2.5 py-1.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-600 mr-1">
            Cover Theme:
          </span>
          {COVER_PALETTES.map((pal) => (
            <button
              key={pal.id}
              type="button"
              data-testid={`story-bible-palette-${pal.id}`}
              onClick={() => updateProjectMeta({ coverPalette: pal.id })}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                (project.coverPalette || "aura-warm") === pal.id
                  ? "bg-gray-950 text-white"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              {pal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Header & Synopsis Card matching 25-editor-story-bible.png */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Story Bible · Production Overview
            </span>
            <h2 className="text-2xl font-extrabold text-gray-950 mt-0.5">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            disabled={generatingSynopsis}
            onClick={handleAutoSynopsis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition"
          >
            <Sparkles className="w-4 h-4" />
            {generatingSynopsis
              ? "Generating Synopsis..."
              : "Auto-Generate Synopsis with AI"}
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Story Synopsis & Logline
          </label>
          <textarea
            rows={3}
            value={project.synopsis}
            onChange={(e) => updateProjectMeta({ synopsis: e.target.value })}
            placeholder="Write a concise logline, tone description, and narrative summary for your storyboard..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Screenplay & Shot Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">Scenes</div>
              <div className="text-2xl font-extrabold text-gray-950">
                {sceneCount}
              </div>
            </div>
            <Film className="w-6 h-6 text-blue-600" />
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">Total Shots</div>
              <div className="text-2xl font-extrabold text-gray-950">
                {project.stages.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("script")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Open Script →
            </button>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">
                Frame Resolution
              </div>
              <div className="text-base font-extrabold text-gray-950">
                {project.width}×{project.height} ({project.aspectRatio})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Style Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">
            Visual Style Direction
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => updateProjectMeta({ visualStyle: style.id })}
              className={`p-3.5 rounded-xl border text-left transition ${
                project.visualStyle === style.id
                  ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-xs font-bold text-gray-900">{style.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* @Elements Cast, Props & Locations */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AtSign className="w-5 h-5 text-blue-600" />
              Story Elements (@Characters, @Props & @Backgrounds)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Define recurring characters, props, and locations for consistent visual
              storyboarding.
            </p>
          </div>

          <form onSubmit={handleAddElement} className="flex items-center gap-2">
            <input
              type="text"
              value={newElName}
              onChange={(e) => setNewElName(e.target.value)}
              placeholder="New @element name..."
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
            />
            <select
              value={newElCategory}
              onChange={(e) => setNewElCategory(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option value="CHARACTER">Character</option>
              <option value="PROP">Prop</option>
              <option value="BACKGROUND">Background</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-gray-950 text-white text-xs font-bold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["CHARACTER", "PROP", "BACKGROUND"].map((cat) => {
            const list = (project.elements || []).filter(
              (el) => el.category === cat
            );
            return (
              <div
                key={cat}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {cat}S ({list.length})
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-gray-400">None added yet.</p>
                ) : (
                  list.map((el) => (
                    <div
                      key={el.id}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-gray-900">{el.name}</span>
                      <span className="font-mono text-blue-600">{el.handle}</span>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
