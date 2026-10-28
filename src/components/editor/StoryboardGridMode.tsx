"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import {
  Plus,
  Copy,
  Trash2,
  Edit3,
  Clock,
  Camera,
  Move,
  Search,
  Sparkles,
  LayoutGrid,
  FolderPlus,
} from "lucide-react";

const CAMERA_ANGLES = [
  "Eye Level",
  "Low Angle",
  "High Angle",
  "Dutch Angle",
  "Overhead / Bird's Eye",
  "Over the Shoulder",
];

const SHOT_SIZES = [
  "Extreme Wide Shot (EWS)",
  "Wide Shot (WS)",
  "Medium Shot (MS)",
  "Medium Close-Up (MCU)",
  "Close-Up (CU)",
  "Extreme Close-Up (ECU)",
];

const CAMERA_MOVEMENTS = [
  "Static",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Zoom In",
  "Zoom Out",
  "Dolly Push In",
  "Tracking Shot",
  "Handheld",
];

export function StoryboardGridMode() {
  const {
    project,
    activeStageId,
    setActiveStageId,
    setViewMode,
    addStage,
    duplicateStage,
    deleteStage,
    updateStage,
    updateStageProperty,
    updateProjectMeta,
  } = useEditor();

  const [gridCols, setGridCols] = useState<"compact" | "2" | "3" | "4">("3");
  const [searchFilter, setSearchFilter] = useState("");
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);

  const handleAddScene = () => {
    const existingScenes = Array.from(
      new Set(project.stages.map((s) => s.sceneNumber || 1))
    );
    const nextSceneNum = Math.max(1, ...existingScenes) + 1;
    addStage({
      title: `Scene ${nextSceneNum} Opening Shot`,
      sceneNumber: nextSceneNum,
    });
    const currentScenes = Array.isArray(project.scenes) ? project.scenes : [];
    updateProjectMeta({
      scenes: [
        ...currentScenes,
        {
          id: `scene_${Date.now()}`,
          title: `INT. SCENE ${nextSceneNum} - DAY`,
          description: "",
          shotIds: [],
          sceneNumber: nextSceneNum,
        },
      ],
    });
  };

  const handleGenerateShotAi = async (stageId: string, promptText: string) => {
    setGeneratingShotId(stageId);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          generationType: "IMAGE",
          prompt: promptText || "Storyboard frame composition",
          style: project.visualStyle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const stage = project.stages.find((s) => s.id === stageId);
        if (stage && data.canvasObjects) {
          updateStage(stageId, {
            canvasObjects: [...stage.canvasObjects, ...data.canvasObjects],
          });
        }
      }
    } finally {
      setGeneratingShotId(null);
    }
  };

  const filteredStages = project.stages.filter((s) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const hay = `${s.title} ${s.propertyValues?.visualdetail || ""} ${
      s.scriptContent || ""
    } #scene${s.sceneNumber || 1}`.toLowerCase();
    return hay.includes(q);
  });

  const gridClass =
    gridCols === "compact"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      : gridCols === "2"
      ? "grid-cols-1 md:grid-cols-2 gap-6"
      : gridCols === "4"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div
      data-testid="editor-mode-storyboard-grid"
      className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6"
    >
      {/* Top Toolbar matching 27-editor-storyboard-grid-view.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700">
            <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
            <select
              data-testid="storyboard-grid-density-select"
              value={gridCols}
              onChange={(e) => setGridCols(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="compact">Compact</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>

          <div className="relative w-64 sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="storyboard-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search, or @ / # for elements & scenes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddScene}
            data-testid="storyboard-add-scene-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-bold hover:bg-gray-50 transition"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            + Add scene
          </button>

          <button
            type="button"
            onClick={() => addStage()}
            data-testid="storyboard-add-shot-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" />
            Add Shot
          </button>
        </div>
      </div>

      {/* Storyboard Shot Cards Grid */}
      <div className={`grid ${gridClass}`}>
        {filteredStages.map((stage, idx) => {
          const isSelected = stage.id === activeStageId;
          return (
            <div
              key={stage.id}
              data-testid={`storyboard-shot-card-${idx + 1}`}
              onClick={() => setActiveStageId(stage.id)}
              className={`rounded-2xl border bg-white overflow-hidden transition flex flex-col ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                  : "border-gray-200 shadow-sm hover:border-gray-300"
              }`}
            >
              {/* Shot Card Header */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/70">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-gray-900 text-white text-[11px] font-bold shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                    S{stage.sceneNumber || 1}
                  </span>
                  <input
                    type="text"
                    value={stage.title}
                    onChange={(e) =>
                      updateStage(stage.id, { title: e.target.value })
                    }
                    className="font-bold text-xs text-gray-900 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none truncate"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Generate AI Shot Composition"
                    data-testid={`storyboard-shot-ai-generate-btn-${idx + 1}`}
                    disabled={generatingShotId === stage.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateShotAi(
                        stage.id,
                        stage.propertyValues?.visualdetail || stage.title
                      );
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold hover:bg-purple-100 inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {generatingShotId === stage.id ? "..." : "Generate"}
                  </button>
                  <button
                    type="button"
                    title="Edit Shot on 2D Canvas"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStageId(stage.id);
                      setViewMode("canvas");
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Canvas
                  </button>
                  <button
                    type="button"
                    title="Duplicate Shot"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateStage(stage.id);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {project.stages.length > 1 && (
                    <button
                      type="button"
                      title="Delete Shot"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStage(stage.id);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Canvas Preview (Double-click opens 2D Canvas) */}
              <div
                onDoubleClick={() => {
                  setActiveStageId(stage.id);
                  setViewMode("canvas");
                }}
                className="p-3 bg-gray-100/70 cursor-pointer relative group"
              >
                <StageMiniPreview
                  width={project.width}
                  height={project.height}
                  backgroundColor={stage.backgroundColor}
                  objects={stage.canvasObjects}
                />
                <div className="absolute bottom-5 right-5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stage.durationSec}s
                </div>
              </div>

              {/* Shot Properties Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Visual Detail / Action
                  </label>
                  <textarea
                    rows={2}
                    value={stage.propertyValues?.visualdetail || ""}
                    onChange={(e) =>
                      updateStageProperty(
                        stage.id,
                        "visualdetail",
                        e.target.value
                      )
                    }
                    placeholder="Describe action, framing, or dialogue..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Camera Angle, Shot Size & Movement Pills */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 flex items-center gap-1 mb-0.5">
                      <Camera className="w-2.5 h-2.5" /> Angle
                    </label>
                    <select
                      value={stage.propertyValues?.cameraangle || "Eye Level"}
                      onChange={(e) =>
                        updateStageProperty(
                          stage.id,
                          "cameraangle",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 rounded-lg border border-gray-200 text-[11px] font-medium bg-gray-50"
                    >
                      {CAMERA_ANGLES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">
                      Shot Size
                    </label>
                    <select
                      value={
                        stage.propertyValues?.shotsize || "Medium Shot (MS)"
                      }
                      onChange={(e) =>
                        updateStageProperty(
                          stage.id,
                          "shotsize",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 rounded-lg border border-gray-200 text-[11px] font-medium bg-gray-50"
                    >
                      {SHOT_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 flex items-center gap-1 mb-0.5">
                      <Move className="w-2.5 h-2.5" /> Move
                    </label>
                    <select
                      value={stage.propertyValues?.movement || "Static"}
                      onChange={(e) =>
                        updateStageProperty(
                          stage.id,
                          "movement",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 rounded-lg border border-gray-200 text-[11px] font-medium bg-gray-50"
                    >
                      {CAMERA_MOVEMENTS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Shot Card */}
        <button
          type="button"
          onClick={() => addStage()}
          className="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 hover:bg-blue-50/40 hover:border-blue-400 transition flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Add Next Shot</span>
        </button>
      </div>
    </div>
  );
}
