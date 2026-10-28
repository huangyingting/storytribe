"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { EXPORT_LAYOUTS } from "@/lib/catalog/storytribe-assets";
import {
  downloadTextFile,
  generatePrintableStoryboardHtml,
  generateProjectJson,
  generateShotListCsv,
} from "@/lib/export/exporter";
import type { ExportLayoutType } from "@/types/storytribe";
import { Download, Printer, X } from "lucide-react";

export function ExportProjectModal({ onClose }: { onClose: () => void }) {
  const { project } = useEditor();
  const [selectedLayout, setSelectedLayout] =
    useState<ExportLayoutType>("grid_storyboard");

  const handleExport = () => {
    if (selectedLayout === "shot_list_table") {
      const csv = generateShotListCsv(project);
      downloadTextFile(
        `${project.title.toLowerCase().replace(/\s+/g, "-")}-shot-list.csv`,
        csv,
        "text/csv"
      );
      return;
    }

    const html = generatePrintableStoryboardHtml(project, {
      layout: selectedLayout,
      paperSize: "A4",
      orientation: "landscape",
      columnsPerPage: 3,
      includeTitlePage: true,
      includeSceneHeaders: true,
      includeProperties: ["visualdetail", "cameraangle", "shotsize", "movement"],
      includeTimecode: true,
      highResolution: true,
    });

    downloadTextFile(
      `${project.title.toLowerCase().replace(/\s+/g, "-")}-${selectedLayout}.html`,
      html,
      "text/html"
    );
  };

  const handleExportJson = () => {
    const json = generateProjectJson(project);
    downloadTextFile(
      `${project.title.toLowerCase().replace(/\s+/g, "-")}.storytribe.json`,
      json,
      "application/json"
    );
  };

  return (
    <div
      data-testid="export-project-modal"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-950">
              Export Storyboard & Production Sheets
            </h3>
            <p className="text-xs text-gray-500">
              Choose from 6 StoryTribe production export layouts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Export Layouts matching 37-editor-export-modal.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPORT_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              data-testid={`export-layout-${layout.id}`}
              onClick={() => setSelectedLayout(layout.id as ExportLayoutType)}
              className={`p-4 rounded-2xl border text-left transition ${
                selectedLayout === layout.id
                  ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-xs font-bold text-gray-900">
                {layout.label}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {layout.desc}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Download Project JSON
          </button>

          <button
            type="button"
            onClick={handleExport}
            data-testid="export-download-btn"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            Export {selectedLayout === "shot_list_table" ? "CSV" : "Production Sheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
