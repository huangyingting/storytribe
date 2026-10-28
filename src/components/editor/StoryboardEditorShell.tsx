"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorProvider, useEditor } from "./EditorContext";
import { StoryBibleMode } from "./StoryBibleMode";
import { ScriptWriterMode } from "./ScriptWriterMode";
import { StoryboardGridMode } from "./StoryboardGridMode";
import { CanvasMode } from "./CanvasMode";
import { TableMode } from "./TableMode";
import { VideoAnimaticMode } from "./VideoAnimaticMode";
import { ShareProjectModal } from "./ShareProjectModal";
import { ExportProjectModal } from "./ExportProjectModal";
import type { EditorViewMode, FullProjectData } from "@/types/storytribe";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Share2,
  Download,
  ChevronDown,
  Settings,
  Copy,
  Trash2,
  Maximize2,
  Keyboard,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

const EDITOR_TABS: Array<{ id: EditorViewMode; label: string }> = [
  { id: "story_bible", label: "Story Bible" },
  { id: "script", label: "Script" },
  { id: "storyboard", label: "Storyboard" },
  { id: "canvas", label: "Canvas" },
  { id: "table", label: "Table" },
  { id: "video", label: "Video" },
];

const ASPECT_PRESETS = [
  { label: "16:9 Widescreen (1920×1080)", ratio: "16:9", width: 1920, height: 1080 },
  { label: "9:16 Vertical (1080×1920)", ratio: "9:16", width: 1080, height: 1920 },
  { label: "1:1 Square (1080×1080)", ratio: "1:1", width: 1080, height: 1080 },
  { label: "4:3 Classic (1440×1080)", ratio: "4:3", width: 1440, height: 1080 },
  { label: "2.35:1 CinemaScope (2350×1000)", ratio: "2.35:1", width: 2350, height: 1000 },
];

function EditorInner() {
  const router = useRouter();
  const {
    project,
    viewMode,
    setViewMode,
    activeStage,
    setActiveStageId,
    canUndo,
    canRedo,
    undo,
    redo,
    saving,
    lastSavedAt,
    updateProjectMeta,
    saveToCloud,
  } = useEditor();

  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);
  const [presentAutoPlay, setPresentAutoPlay] = useState(false);

  const activeShotIdx = Math.max(
    0,
    project.stages.findIndex((s) => s.id === activeStage?.id)
  );

  React.useEffect(() => {
    if (!presentOpen || !presentAutoPlay) return;
    const timer = setInterval(() => {
      const nextIdx = (activeShotIdx + 1) % Math.max(1, project.stages.length);
      const nextStage = project.stages[nextIdx];
      if (nextStage) setActiveStageId(nextStage.id);
    }, (activeStage?.durationSec || 3) * 1000);
    return () => clearInterval(timer);
  }, [presentOpen, presentAutoPlay, activeShotIdx, project.stages, activeStage, setActiveStageId]);

  const handleDuplicateProject = async () => {
    setProjectMenuOpen(false);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.project?.id) {
        router.push(`/app/editor/${data.project.id}`);
      }
    }
  };

  const handleDeleteProject = async () => {
    setProjectMenuOpen(false);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/app/projects");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top 6-Mode Navigation Header matching upstream StoryTribe */}
      <header className="h-14 bg-white border-b border-gray-200 px-3 sm:px-5 flex items-center justify-between gap-3 sticky top-0 z-30">
        {/* Left: Back to Dashboard + Editable Project Title + Project Dropdown + Undo/Redo */}
        <div className="flex items-center gap-2 min-w-0 relative">
          <Link
            href="/app/dashboard"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <input
            type="text"
            data-testid="editor-project-title-input"
            value={project.title}
            onChange={(e) => updateProjectMeta({ title: e.target.value })}
            className="font-extrabold text-sm text-gray-950 bg-transparent border-b border-transparent focus:border-blue-600 focus:outline-none truncate max-w-[160px] sm:max-w-[220px]"
          />

          <button
            type="button"
            data-testid="editor-project-menu-btn"
            onClick={() => setProjectMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            title="Project menu"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {projectMenuOpen && (
            <div
              data-testid="editor-project-menu-dropdown"
              className="absolute left-10 top-11 w-48 rounded-2xl bg-white border border-gray-200 shadow-xl py-1.5 z-50 text-xs font-semibold text-gray-700"
            >
              <button
                type="button"
                data-testid="editor-project-settings-item"
                onClick={() => {
                  setProjectMenuOpen(false);
                  setProjectSettingsOpen(true);
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
                Project settings
              </button>
              <button
                type="button"
                data-testid="editor-make-copy-item"
                onClick={handleDuplicateProject}
                className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                Make a copy
              </button>
              <button
                type="button"
                data-testid="editor-delete-project-item"
                onClick={handleDeleteProject}
                className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 ml-1 pl-2 border-l border-gray-200">
            <button
              type="button"
              disabled={!canUndo}
              onClick={undo}
              title="Undo"
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={redo}
              title="Redo"
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: 6 View Mode Tabs */}
        <nav
          aria-label="Storyboard Editor Modes"
          className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto"
        >
          {EDITOR_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`editor-tab-${t.id}`}
              onClick={() => setViewMode(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                viewMode === t.id
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right: Present, Shortcuts, Save, Share & Export Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {lastSavedAt && (
            <span className="hidden xl:inline text-[11px] text-gray-400 mr-1">
              Saved {lastSavedAt}
            </span>
          )}

          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            data-testid="editor-shortcuts-btn"
            title="Keyboard shortcuts"
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setPresentOpen(true)}
            data-testid="projecteditor-button-present"
            title="Present storyboard slideshow"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 hover:bg-gray-50"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Present</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => saveToCloud()}
            data-testid="editor-save-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 hover:bg-gray-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            data-testid="editor-share-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 hover:bg-gray-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => setExportOpen(true)}
            data-testid="editor-export-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Active Mode Content */}
      <div className="flex-1">
        {viewMode === "story_bible" && <StoryBibleMode />}
        {viewMode === "script" && <ScriptWriterMode />}
        {viewMode === "storyboard" && <StoryboardGridMode />}
        {viewMode === "canvas" && <CanvasMode />}
        {viewMode === "table" && <TableMode />}
        {viewMode === "video" && <VideoAnimaticMode />}
      </div>

      {/* Project Settings Modal */}
      {projectSettingsOpen && (
        <div
          data-testid="project-settings-modal"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-950">
                Project Settings
              </h2>
              <button
                type="button"
                onClick={() => setProjectSettingsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  data-testid="project-settings-title-input"
                  value={project.title}
                  onChange={(e) => updateProjectMeta({ title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Canvas Aspect Ratio & Resolution
                </label>
                <select
                  data-testid="project-settings-aspect-select"
                  value={project.aspectRatio}
                  onChange={(e) => {
                    const preset =
                      ASPECT_PRESETS.find((p) => p.ratio === e.target.value) ||
                      ASPECT_PRESETS[0];
                    updateProjectMeta({
                      aspectRatio: preset.ratio,
                      width: preset.width,
                      height: preset.height,
                    });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  {ASPECT_PRESETS.map((p) => (
                    <option key={p.ratio} value={p.ratio}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Logline / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={project.synopsis}
                  onChange={(e) => updateProjectMeta({ synopsis: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await saveToCloud();
                  setProjectSettingsOpen(false);
                }}
                data-testid="project-settings-save-btn"
                className="px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <div
          data-testid="editor-shortcuts-modal"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-600" />
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                data-testid="editor-shortcuts-close-btn"
                onClick={() => setShortcutsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {[
                { label: "Undo change", keys: "⌘ + Z" },
                { label: "Redo change", keys: "⌘ + ⇧ + Z" },
                { label: "Select / Move tool", keys: "V" },
                { label: "Freehand Sketch / Draw", keys: "B" },
                { label: "Add Text / Caption", keys: "T" },
                { label: "Drop Comment Pin", keys: "C" },
                { label: "Previous / Next Shot", keys: "[ / ]" },
                { label: "Present Slideshow", keys: "⌘ + Enter" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="py-2.5 flex items-center justify-between"
                >
                  <span className="text-gray-600 font-medium">{s.label}</span>
                  <kbd className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200 font-mono text-[11px] font-bold text-gray-800">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Presentation Slideshow Mode */}
      {presentOpen && activeStage && (
        <div
          data-testid="presentation-slideshow-overlay"
          className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col justify-between p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
                Shot {activeShotIdx + 1} / {project.stages.length}
              </span>
              <span className="text-sm font-bold">{activeStage.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="presentation-autoplay-btn"
                onClick={() => setPresentAutoPlay((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                {presentAutoPlay ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Auto-Play
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Auto-Play
                  </>
                )}
              </button>
              <button
                type="button"
                data-testid="presentation-exit-btn"
                onClick={() => {
                  setPresentAutoPlay(false);
                  setPresentOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-gray-950 text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" /> Exit Presentation
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center my-6">
            <div
              className="w-full max-w-4xl aspect-video rounded-3xl shadow-2xl border border-white/15 relative overflow-hidden flex items-center justify-center p-8"
              style={{ backgroundColor: activeStage.backgroundColor || "#FFFBEB" }}
            >
              <div className="text-center space-y-2 text-gray-900">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {activeStage.propertyValues?.shotsize || "Medium Shot"} ·{" "}
                  {activeStage.propertyValues?.cameraangle || "Eye Level"}
                </div>
                <div className="text-2xl font-extrabold">{activeStage.title}</div>
                {activeStage.scriptContent && (
                  <p className="text-sm text-gray-700 max-w-xl mx-auto pt-2">
                    {activeStage.scriptContent}
                  </p>
                )}
                <div className="text-xs text-gray-500 pt-2">
                  {activeStage.canvasObjects.length} stage layer(s)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              data-testid="presentation-prev-btn"
              disabled={activeShotIdx <= 0}
              onClick={() => {
                const prev = project.stages[activeShotIdx - 1];
                if (prev) setActiveStageId(prev.id);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Shot
            </button>
            <button
              type="button"
              data-testid="presentation-next-btn"
              disabled={activeShotIdx >= project.stages.length - 1}
              onClick={() => {
                const next = project.stages[activeShotIdx + 1];
                if (next) setActiveStageId(next.id);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold inline-flex items-center gap-1"
            >
              Next Shot <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {shareOpen && <ShareProjectModal onClose={() => setShareOpen(false)} />}
      {exportOpen && <ExportProjectModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

export function StoryboardEditorShell({
  initialProject,
}: {
  initialProject: FullProjectData;
}) {
  return (
    <EditorProvider initialProject={initialProject}>
      <EditorInner />
    </EditorProvider>
  );
}
