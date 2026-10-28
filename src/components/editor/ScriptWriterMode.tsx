"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { parseScriptToStages } from "@/lib/screenplay-parser";
import { FileText, Sparkles, RefreshCw, Plus } from "lucide-react";

export function ScriptWriterMode() {
  const { project, updateProjectMeta, addStage } = useEditor();
  const [scriptText, setScriptText] = useState(
    project.scriptContent ||
      "INT. STUDIO SET - DAY\nWide establishing shot of the main character entering the room.\nMAYA\nLet's walk through the storyboard!"
  );
  const [generatingAiScript, setGeneratingAiScript] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");

  const insertFormattingBlock = (snippet: string) => {
    const next = `${scriptText.trimEnd()}\n\n${snippet}`;
    setScriptText(next);
    updateProjectMeta({ scriptContent: next });
  };

  const handleSyncToStoryboard = () => {
    updateProjectMeta({ scriptContent: scriptText });
    const parsedStages = parseScriptToStages(scriptText);
    if (parsedStages.length > 0) {
      updateProjectMeta({
        scriptContent: scriptText,
        stages: parsedStages.map((s, idx) => ({
          ...s,
          id:
            project.stages[idx]?.id ||
            `stage_${Date.now()}_${idx}`,
          canvasObjects:
            project.stages[idx]?.canvasObjects?.length
              ? project.stages[idx].canvasObjects
              : s.canvasObjects,
        })),
      });
      setSyncNotice(
        `Synced ${parsedStages.length} shot(s) from screenplay into Storyboard!`
      );
      setTimeout(() => setSyncNotice(""), 3500);
    }
  };

  const handleGenerateAiScript = async () => {
    setGeneratingAiScript(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          generationType: "SCRIPT",
          prompt: project.synopsis || project.title,
          style: project.visualStyle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scriptContent) {
          setScriptText(data.scriptContent);
          updateProjectMeta({ scriptContent: data.scriptContent });
        }
      }
    } finally {
      setGeneratingAiScript(false);
    }
  };

  return (
    <div
      data-testid="editor-mode-script"
      className="max-w-6xl mx-auto p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Left Screenplay Formatting Toolbar & @Elements Reference */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Screenplay Formatting Blocks
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => insertFormattingBlock("INT. NEW LOCATION - DAY")}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 text-left"
            >
              + Scene Heading
            </button>
            <button
              type="button"
              onClick={() =>
                insertFormattingBlock(
                  "Camera tracks alongside @character as they cross the room."
                )
              }
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 text-left"
            >
              + Action Line
            </button>
            <button
              type="button"
              onClick={() =>
                insertFormattingBlock("CHARACTER NAME\n(confident)\nDialogue line here.")
              }
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 text-left"
            >
              + Dialogue Block
            </button>
            <button
              type="button"
              onClick={() => insertFormattingBlock("CUT TO:")}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 text-left"
            >
              + Transition
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              type="button"
              disabled={generatingAiScript}
              onClick={handleGenerateAiScript}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 inline-flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {generatingAiScript
                ? "Writing Screenplay..."
                : "Write Scene with Tribe AI"}
            </button>

            <button
              type="button"
              onClick={handleSyncToStoryboard}
              data-testid="sync-script-to-shots-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 inline-flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Script to Storyboard Shots
            </button>
          </div>

          {syncNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              {syncNotice}
            </div>
          )}
        </div>

        {/* Shot Breakdown Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Linked Storyboard Shots ({project.stages.length})
            </span>
            <button
              type="button"
              onClick={() => addStage()}
              className="text-xs font-bold text-blue-600 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Shot
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {project.stages.map((st, idx) => (
              <div
                key={st.id}
                className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs"
              >
                <div className="font-bold text-gray-900">
                  Shot {idx + 1}: {st.title}
                </div>
                <div className="text-gray-500 truncate mt-0.5">
                  {st.propertyValues?.visualdetail || st.synopsis || "No action description"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Screenplay Document Editor matching 26-editor-script.png */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-gray-900">
              Screenplay Manuscript — {project.title}
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">Fountain / Standard</span>
        </div>

        <textarea
          rows={20}
          data-testid="script-editor-textarea"
          value={scriptText}
          onChange={(e) => {
            setScriptText(e.target.value);
            updateProjectMeta({ scriptContent: e.target.value });
          }}
          placeholder="INT. LOCATION - DAY&#10;Write your scene headings, action lines, and character dialogue..."
          className="w-full p-4 rounded-xl bg-gray-50/60 border border-gray-200 font-mono text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
}
