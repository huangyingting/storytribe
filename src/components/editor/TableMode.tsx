"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import { Plus, Trash2, Edit3, Columns3 } from "lucide-react";

const BUILTIN_KEYS = ["visualdetail", "cameraangle", "shotsize", "movement"];

export function TableMode() {
  const {
    project,
    setActiveStageId,
    setViewMode,
    addStage,
    deleteStage,
    updateStage,
    updateStageProperty,
    updateProjectMeta,
  } = useEditor();

  const [newColName, setNewColName] = useState("");
  const customColumns = (project.annotationFields || []).filter(
    (k) => !BUILTIN_KEYS.includes(k) && k !== "dialogue"
  );

  const handleAddCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newColName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    if (!cleaned) return;
    const existing = project.annotationFields || BUILTIN_KEYS;
    if (!existing.includes(cleaned)) {
      updateProjectMeta({
        annotationFields: [...existing, cleaned],
      });
    }
    setNewColName("");
  };

  return (
    <div
      data-testid="editor-mode-table"
      className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Production Shot List Table
          </span>
          <h2 className="text-lg font-extrabold text-gray-950">
            {project.title} — {project.stages.length} Shot(s)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <form
            onSubmit={handleAddCustomColumn}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              data-testid="table-new-property-input"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Custom column (e.g. Lens, SFX)..."
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs"
            />
            <button
              type="submit"
              data-testid="table-add-property-col-btn"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <Columns3 className="w-3.5 h-3.5" />
              + Property Column
            </button>
          </form>

          <button
            type="button"
            onClick={() => addStage()}
            data-testid="table-add-shot-row-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Shot Row
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4 w-14">Shot #</th>
              <th className="py-3 px-4 w-36">Preview</th>
              <th className="py-3 px-4 w-44">Shot Title</th>
              <th className="py-3 px-4">Visual Detail / Action</th>
              <th className="py-3 px-4 w-40">Camera Angle</th>
              <th className="py-3 px-4 w-44">Shot Size</th>
              <th className="py-3 px-4 w-36">Movement</th>
              {customColumns.map((colKey) => (
                <th key={colKey} className="py-3 px-4 w-36">
                  {colKey.replace(/_/g, " ")}
                </th>
              ))}
              <th className="py-3 px-4 w-24">Duration (s)</th>
              <th className="py-3 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {project.stages.map((st, idx) => (
              <tr key={st.id} className="hover:bg-gray-50/70">
                <td className="py-3 px-4 font-bold text-gray-900">
                  #{idx + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="w-28">
                    <StageMiniPreview
                      width={project.width}
                      height={project.height}
                      backgroundColor={st.backgroundColor}
                      objects={st.canvasObjects}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) =>
                      updateStage(st.id, { title: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-900"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.propertyValues?.visualdetail || ""}
                    onChange={(e) =>
                      updateStageProperty(st.id, "visualdetail", e.target.value)
                    }
                    placeholder="Action / dialogue..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.propertyValues?.cameraangle || "Eye Level"}
                    onChange={(e) =>
                      updateStageProperty(st.id, "cameraangle", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.propertyValues?.shotsize || "Medium Shot (MS)"}
                    onChange={(e) =>
                      updateStageProperty(st.id, "shotsize", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.propertyValues?.movement || "Static"}
                    onChange={(e) =>
                      updateStageProperty(st.id, "movement", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                </td>
                {customColumns.map((colKey) => (
                  <td key={colKey} className="py-3 px-4">
                    <input
                      type="text"
                      data-testid={`table-custom-cell-${colKey}-${idx + 1}`}
                      value={st.propertyValues?.[colKey] || ""}
                      onChange={(e) =>
                        updateStageProperty(st.id, colKey, e.target.value)
                      }
                      placeholder={colKey}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200"
                    />
                  </td>
                ))}
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={st.durationSec}
                    onChange={(e) =>
                      updateStage(st.id, {
                        durationSec: Number(e.target.value) || 3,
                      })
                    }
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStageId(st.id);
                        setViewMode("canvas");
                      }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                      title="Open in Canvas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {project.stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteStage(st.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        title="Delete Shot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
