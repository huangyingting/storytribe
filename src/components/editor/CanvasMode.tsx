"use client";

import React, { useRef, useState } from "react";
import { useEditor } from "./EditorContext";
import { CanvasObjectSvg } from "@/components/canvas/SvgAssetRenderer";
import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_HAIR_STYLES,
  CHARACTER_OUTFITS,
  CHARACTER_POSES,
  PROP_AND_SCENE_ASSETS,
  SCENE_BACKDROPS,
  VISUAL_STYLES,
} from "@/lib/catalog/storytribe-assets";
import {
  MousePointer,
  Sparkles,
  AtSign,
  Search,
  UserRound,
  PenTool,
  MessageSquarePlus,
  PlusCircle,
  Layers,
  Sliders,
  Info,
  MessageSquare,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

export function CanvasMode() {
  const {
    project,
    activeStage,
    activeStageId,
    setActiveStageId,
    selectedObjectId,
    setSelectedObjectId,
    selectedObject,
    activeMenu,
    setActiveMenu,
    rightPanelTab,
    setRightPanelTab,
    zoom,
    setZoom,
    addStage,
    updateStage,
    updateStageProperty,
    addCanvasObject,
    updateCanvasObject,
    deleteCanvasObject,
    reorderCanvasObject,
    refreshComments,
  } = useEditor();

  // Character builder local state
  const [charPose, setCharPose] = useState("waving");
  const [charExpr, setCharExpr] = useState("happy");
  const [charHair, setCharHair] = useState("short");
  const [charOutfit, setCharOutfit] = useState("casual");
  const [charAngle, setCharAngle] = useState<"front" | "three-quarter" | "side" | "back">("front");
  const [charSkin, setCharSkin] = useState("#F5CBA7");
  const [charTopColor, setCharTopColor] = useState("#2563EB");

  // Tribe AI prompt state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState(project.visualStyle || "color-shaded");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Asset search state
  const [assetQuery, setAssetQuery] = useState("");
  const [assetCategoryTab, setAssetCategoryTab] = useState<"all" | "props" | "backdrops">("all");

  // Freehand sketch state
  const [brushStyle, setBrushStyle] = useState<"normal" | "inertia" | "dashed" | "dotted" | "eraser">("normal");
  const [brushColor, setBrushColor] = useState("#18181B");
  const [brushWidth, setBrushWidth] = useState(4);
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const isDrawingRef = useRef(false);

  // Comment pin & filter state
  const [pinCommentDraft, setPinCommentDraft] = useState("Check camera framing here");
  const [commentStatusFilter, setCommentStatusFilter] = useState<"open" | "resolved">("open");

  // Dragging object state
  const dragStateRef = useRef<{
    objId: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Comment creation state
  const [newCommentText, setNewCommentText] = useState("");

  if (!activeStage) return null;

  const handleInsertCharacter = () => {
    addCanvasObject({
      type: "character",
      name: `Character (${charPose} · ${charAngle})`,
      x: 560,
      y: 260,
      width: 280,
      height: 520,
      rotation: 0,
      flipX: charAngle === "side",
      flipY: false,
      opacity: 1,
      characterConfig: {
        pose: charPose,
        expression: charExpr,
        hairStyle: charHair,
        skinTone: charSkin,
        hairColor: "#2C1B18",
        topColor: charTopColor,
        bottomColor: "#1E293B",
        outfit: charOutfit,
        viewAngle: charAngle,
      },
    });
  };

  const handleInsertBackdrop = (bgId: string, label: string) => {
    addCanvasObject({
      type: "backdrop",
      name: `Scene: ${label}`,
      x: 0,
      y: 0,
      width: project.width,
      height: project.height,
      rotation: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      assetId: bgId,
    });
  };

  const handleRunAiShot = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          generationType: "SHOT_IMAGE",
          prompt: aiPrompt.trim(),
          style: aiStyle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.canvasObjects)) {
          updateStage(activeStage.id, {
            canvasObjects: data.canvasObjects,
          });
          updateStageProperty(activeStage.id, "visualdetail", aiPrompt.trim());
        }
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const stageX = Math.round((e.clientX - rect.left) / zoom);
    const stageY = Math.round((e.clientY - rect.top) / zoom);

    if (activeMenu === "sketch") {
      isDrawingRef.current = true;
      setDrawingPoints([{ x: stageX, y: stageY }]);
      return;
    }

    if (activeMenu === "comment") {
      const content = (pinCommentDraft || "Great camera framing!").trim();
      if (content) {
        fetch(`/api/projects/${project.id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stageId: activeStage.id,
            content,
            pinX: stageX,
            pinY: stageY,
          }),
        }).then(() => refreshComments());
      }
      return;
    }

    if (e.target === e.currentTarget) {
      setSelectedObjectId(null);
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const stageX = Math.round((e.clientX - rect.left) / zoom);
    const stageY = Math.round((e.clientY - rect.top) / zoom);

    if (activeMenu === "sketch" && isDrawingRef.current) {
      setDrawingPoints((prev) => [...prev, { x: stageX, y: stageY }]);
      return;
    }

    if (dragStateRef.current) {
      const dx = Math.round((e.clientX - dragStateRef.current.startClientX) / zoom);
      const dy = Math.round((e.clientY - dragStateRef.current.startClientY) / zoom);
      updateCanvasObject(dragStateRef.current.objId, {
        x: dragStateRef.current.origX + dx,
        y: dragStateRef.current.origY + dy,
      });
    }
  };

  const handleStageMouseUp = () => {
    if (activeMenu === "sketch" && isDrawingRef.current) {
      isDrawingRef.current = false;
      if (drawingPoints.length > 1) {
        if (brushStyle === "eraser") {
          const lastObj = activeStage.canvasObjects[activeStage.canvasObjects.length - 1];
          if (lastObj) deleteCanvasObject(lastObj.id);
        } else {
          const d = drawingPoints
            .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`)
            .join(" ");
          addCanvasObject({
            type: "path",
            name: `Sketch (${brushStyle})`,
            x: 0,
            y: 0,
            width: project.width,
            height: project.height,
            rotation: 0,
            flipX: false,
            flipY: false,
            opacity: 1,
            pathData: d,
            strokeColor: brushColor,
            strokeWidth: brushWidth,
          });
        }
      }
      setDrawingPoints([]);
    }
    dragStateRef.current = null;
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await fetch(`/api/projects/${project.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageId: activeStage.id,
        content: newCommentText.trim(),
        pinX: 400,
        pinY: 300,
      }),
    });
    setNewCommentText("");
    refreshComments();
  };

  const stageComments = (project.comments || []).filter(
    (c) => !c.stageId || c.stageId === activeStage.id
  );

  return (
    <div
      data-testid="editor-mode-canvas"
      className="h-[calc(100vh-56px)] flex overflow-hidden bg-[#F1F5F9]"
    >
      {/* Left Vertical Tool Rail matching 28-editor-canvas-mode.png */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-2 z-20 shrink-0">
        {[
          { id: "select", label: "Select", icon: MousePointer },
          { id: "ai", label: "Tribe AI", icon: Sparkles },
          { id: "elements", label: "Elements", icon: AtSign },
          { id: "search", label: "Search", icon: Search },
          { id: "character", label: "Character", icon: UserRound },
          { id: "sketch", label: "Sketch", icon: PenTool },
          { id: "comment", label: "Comment", icon: MessageSquarePlus },
          { id: "create", label: "Create", icon: PlusCircle },
        ].map((tool) => (
          <button
            key={tool.id}
            type="button"
            data-testid={`canvas-tool-${tool.id}`}
            onClick={() => setActiveMenu(tool.id as any)}
            className={`w-12 py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeMenu === tool.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tool.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Expandable Tool Drawer when activeMenu !== 'select' */}
      {activeMenu !== "select" && (
        <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto space-y-4 shrink-0 z-10">
          {activeMenu === "ai" && (
            <div className="space-y-4">
              <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Tribe AI Shot Generator
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shot Description Prompt
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Barista smiling in a cozy cafe saying Welcome!"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Visual Style
                </label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  {VISUAL_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={aiGenerating}
                onClick={handleRunAiShot}
                data-testid="canvas-ai-generate-btn"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                {aiGenerating ? "Synthesizing Shot..." : "Generate Shot (1 Credit)"}
              </button>
            </div>
          )}

          {activeMenu === "character" && (
            <div className="space-y-4">
              <div className="font-bold text-sm text-gray-900">
                Character Rig Builder
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  View Angle
                </label>
                <select
                  data-testid="canvas-char-angle-select"
                  value={charAngle}
                  onChange={(e) => setCharAngle(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  <option value="front">Front View</option>
                  <option value="three-quarter">3/4 View</option>
                  <option value="side">Side Profile</option>
                  <option value="back">Back View</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Pose
                </label>
                <select
                  value={charPose}
                  onChange={(e) => setCharPose(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  {CHARACTER_POSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Facial Expression
                </label>
                <select
                  value={charExpr}
                  onChange={(e) => setCharExpr(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  {CHARACTER_EXPRESSIONS.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Hair Style
                </label>
                <select
                  value={charHair}
                  onChange={(e) => setCharHair(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  {CHARACTER_HAIR_STYLES.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Wardrobe Outfit
                </label>
                <select
                  value={charOutfit}
                  onChange={(e) => setCharOutfit(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  {CHARACTER_OUTFITS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Skin Tone
                  </label>
                  <input
                    type="color"
                    value={charSkin}
                    onChange={(e) => setCharSkin(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Outfit Color
                  </label>
                  <input
                    type="color"
                    value={charTopColor}
                    onChange={(e) => setCharTopColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleInsertCharacter}
                data-testid="canvas-insert-character-btn"
                className="w-full py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
              >
                + Insert Character on Stage
              </button>
            </div>
          )}

          {activeMenu === "search" && (
            <div className="space-y-4">
              <div className="font-bold text-sm text-gray-900">
                Props & Scene Backdrops
              </div>
              <input
                type="text"
                data-testid="canvas-asset-search-input"
                value={assetQuery}
                onChange={(e) => setAssetQuery(e.target.value)}
                placeholder="Search props or scenes..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
              />

              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
                {[
                  { id: "all", label: "All" },
                  { id: "backdrops", label: "Backdrops" },
                  { id: "props", label: "Props" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`canvas-search-tab-${tab.id}`}
                    onClick={() => setAssetCategoryTab(tab.id as any)}
                    className={`py-1 rounded-lg transition ${
                      assetCategoryTab === tab.id
                        ? "bg-white text-gray-950 shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {(assetCategoryTab === "all" || assetCategoryTab === "backdrops") && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Scene Backdrops
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SCENE_BACKDROPS.filter((b) =>
                      b.label.toLowerCase().includes(assetQuery.toLowerCase())
                    ).map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        data-testid={`canvas-insert-backdrop-${bg.id}`}
                        onClick={() => handleInsertBackdrop(bg.id, bg.label)}
                        className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 text-left text-[11px] font-semibold text-gray-800"
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(assetCategoryTab === "all" || assetCategoryTab === "props") && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Illustrated Props
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PROP_AND_SCENE_ASSETS.filter((p) =>
                      p.name.toLowerCase().includes(assetQuery.toLowerCase())
                    ).map((prop) => (
                      <button
                        key={prop.id}
                        type="button"
                        data-testid={`canvas-insert-prop-${prop.id}`}
                        onClick={() =>
                          addCanvasObject({
                            type: "prop",
                            name: prop.name,
                            x: 760,
                            y: 440,
                            width: 240,
                            height: 180,
                            rotation: 0,
                            flipX: false,
                            flipY: false,
                            opacity: 1,
                            fillColor: prop.color,
                            strokeColor: "#18181B",
                          })
                        }
                        className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 text-left text-[11px] font-semibold text-gray-800"
                      >
                        {prop.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === "elements" && (
            <div className="space-y-3">
              <div className="font-bold text-sm text-gray-900">
                Project @Elements
              </div>
              {(project.elements || []).map((el) => (
                <button
                  key={el.id}
                  type="button"
                  onClick={() =>
                    addCanvasObject({
                      type: el.category === "CHARACTER" ? "character" : "prop",
                      name: `${el.name} (${el.handle})`,
                      x: 640,
                      y: 300,
                      width: 260,
                      height: 480,
                      rotation: 0,
                      flipX: false,
                      flipY: false,
                      opacity: 1,
                      characterConfig:
                        el.category === "CHARACTER"
                          ? {
                              pose: "standing",
                              expression: "happy",
                              hairStyle: "bun",
                              skinTone: "#E5B887",
                              hairColor: "#18181B",
                              topColor: "#EA580C",
                              bottomColor: "#1E293B",
                              outfit: "apron",
                            }
                          : undefined,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 text-left text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-gray-900">{el.name}</span>
                  <span className="font-mono text-blue-600">{el.handle}</span>
                </button>
              ))}
            </div>
          )}

          {activeMenu === "sketch" && (
            <div className="space-y-4">
              <div className="font-bold text-sm text-gray-900">
                Freehand Storyboard Brush
              </div>
              <p className="text-xs text-gray-500">
                Select a brush style and drag on the canvas stage to draw storyboard lines or camera arrows.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Brush Style
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "normal", label: "Normal" },
                      { id: "inertia", label: "Inertia" },
                      { id: "dashed", label: "Dashed" },
                      { id: "dotted", label: "Dotted" },
                      { id: "eraser", label: "Eraser" },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      data-testid={`canvas-brush-style-${b.id}`}
                      onClick={() => setBrushStyle(b.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                        brushStyle === b.id
                          ? "border-gray-950 bg-gray-950 text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Quick Color Swatches
                </label>
                <div className="flex items-center gap-1.5 mb-2">
                  {["#18181B", "#EF4444", "#2563EB", "#16A34A", "#F59E0B", "#9333EA"].map(
                    (swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() => setBrushColor(swatch)}
                        style={{ backgroundColor: swatch }}
                        className={`w-6 h-6 rounded-full border-2 ${
                          brushColor === swatch ? "border-blue-500 scale-110" : "border-white shadow"
                        }`}
                      />
                    )
                  )}
                </div>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-full h-9 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Stroke Width ({brushWidth}px)
                </label>
                <input
                  type="range"
                  min={2}
                  max={18}
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeMenu === "create" && (
            <div className="space-y-2.5">
              <div className="font-bold text-sm text-gray-900">
                Create Canvas Objects
              </div>
              <button
                type="button"
                data-testid="canvas-add-speech-bubble-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "speech_bubble",
                    name: "Speech Bubble",
                    x: 840,
                    y: 160,
                    width: 360,
                    height: 150,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 1,
                    text: "Action! Camera rolling!",
                    fontSize: 22,
                    bubbleStyle: "speech",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Speech Bubble
              </button>
              <button
                type="button"
                data-testid="canvas-add-thought-bubble-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "speech_bubble",
                    name: "Thought Bubble",
                    x: 840,
                    y: 160,
                    width: 360,
                    height: 150,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 1,
                    text: "What happens next?",
                    fontSize: 22,
                    bubbleStyle: "thought",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Thought Cloud
              </button>
              <button
                type="button"
                data-testid="canvas-add-text-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "text",
                    name: "Title Caption",
                    x: 680,
                    y: 100,
                    width: 480,
                    height: 90,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 1,
                    text: "SCENE 1: ESTABLISHING SHOT",
                    fontSize: 32,
                    strokeColor: "#18181B",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Text Label
              </button>
              <button
                type="button"
                data-testid="canvas-add-rect-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "shape",
                    name: "Highlight Box",
                    x: 720,
                    y: 360,
                    width: 320,
                    height: 220,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 0.85,
                    shapeType: "rect",
                    fillColor: "#FDE047",
                    strokeColor: "#18181B",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Rectangle Shape
              </button>
              <button
                type="button"
                data-testid="canvas-add-circle-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "shape",
                    name: "Spotlight Circle",
                    x: 760,
                    y: 340,
                    width: 240,
                    height: 240,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 0.85,
                    shapeType: "circle",
                    fillColor: "#93C5FD",
                    strokeColor: "#1E3A8A",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Circle Shape
              </button>
              <button
                type="button"
                data-testid="canvas-add-arrow-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "shape",
                    name: "Camera Direction Arrow",
                    x: 680,
                    y: 440,
                    width: 300,
                    height: 80,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 1,
                    shapeType: "arrow",
                    fillColor: "#EF4444",
                    strokeColor: "#991B1B",
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Camera Motion Arrow
              </button>
              <button
                type="button"
                data-testid="canvas-add-frame-btn"
                onClick={() =>
                  addCanvasObject({
                    type: "frame",
                    name: "Rule-of-Thirds Safe Frame",
                    x: 120,
                    y: 80,
                    width: project.width - 240,
                    height: project.height - 160,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    opacity: 1,
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-bold text-gray-800"
              >
                + Camera Safe Frame Guide
              </button>
            </div>
          )}

          {activeMenu === "comment" && (
            <div className="space-y-3">
              <div className="font-bold text-sm text-gray-900">
                Pin Comment Tool
              </div>
              <p className="text-xs text-gray-500">
                Enter your review note below, then click anywhere on the 2D stage to drop a numbered spatial comment pin.
              </p>
              <input
                type="text"
                data-testid="canvas-comment-pin-draft-input"
                value={pinCommentDraft}
                onChange={(e) => setPinCommentDraft(e.target.value)}
                placeholder="Comment to pin on stage..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* Center Interactive 2D Stage Viewport + Bottom Filmstrip */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        <div className="flex-1 flex items-center justify-center overflow-auto p-6">
          <div
            data-testid="canvas-interactive-stage"
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            style={{
              width: project.width * zoom,
              height: project.height * zoom,
              backgroundColor: activeStage.backgroundColor || "#FFFBEB",
            }}
            className="relative shadow-xl rounded-lg border border-gray-300 overflow-hidden select-none"
          >
            <div
              style={{
                width: project.width,
                height: project.height,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
              className="relative"
            >
              {activeStage.canvasObjects
                .filter((o) => !o.hidden)
                .map((obj) => {
                  const isSel = obj.id === selectedObjectId;
                  return (
                    <div
                      key={obj.id}
                      onMouseDown={(e) => {
                        if (activeMenu === "sketch") return;
                        e.stopPropagation();
                        setSelectedObjectId(obj.id);
                        if (!obj.locked) {
                          dragStateRef.current = {
                            objId: obj.id,
                            startClientX: e.clientX,
                            startClientY: e.clientY,
                            origX: obj.x,
                            origY: obj.y,
                          };
                        }
                      }}
                      style={{
                        position: "absolute",
                        left: obj.x,
                        top: obj.y,
                        width: obj.width,
                        height: obj.height,
                        transform: `rotate(${obj.rotation || 0}deg)`,
                        opacity: obj.opacity ?? 1,
                        cursor: obj.locked ? "not-allowed" : "move",
                      }}
                      className={
                        isSel
                          ? "ring-4 ring-blue-600 rounded"
                          : "hover:ring-2 hover:ring-blue-400/60"
                      }
                    >
                      <CanvasObjectSvg item={obj} />
                    </div>
                  );
                })}

              {/* Active live freehand stroke */}
              {drawingPoints.length > 1 && (
                <svg
                  width={project.width}
                  height={project.height}
                  className="absolute inset-0 pointer-events-none"
                >
                  <path
                    d={drawingPoints
                      .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`)
                      .join(" ")}
                    fill="none"
                    stroke={brushColor}
                    strokeWidth={brushWidth}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Spatial Comment Pins */}
              {stageComments.map((c, idx) =>
                c.pinX != null && c.pinY != null ? (
                  <div
                    key={c.id}
                    style={{ left: c.pinX, top: c.pinY }}
                    title={`${c.authorName}: ${c.content}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    {idx + 1}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Bottom Filmstrip & Zoom Controls */}
        <div className="h-20 bg-white border-t border-gray-200 px-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {project.stages.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStageId(st.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold shrink-0 transition ${
                  st.id === activeStageId
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                #{idx + 1} {st.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => addStage()}
              className="px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-blue-500 shrink-0 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Shot
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.15, Number((zoom - 0.05).toFixed(2))))}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(1.5, Number((zoom + 0.05).toFixed(2))))}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right 4-Tab Inspector Panel matching 28-editor-canvas-mode.png */}
      <div className="w-76 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="grid grid-cols-4 border-b border-gray-200 p-1.5 gap-1">
          {[
            { id: "shot_info", label: "Shot", icon: Info },
            { id: "layers", label: "Layers", icon: Layers },
            { id: "properties", label: "Style", icon: Sliders },
            { id: "comments", label: "Chat", icon: MessageSquare },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`canvas-right-tab-${t.id}`}
              onClick={() => setRightPanelTab(t.id as any)}
              className={`py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 ${
                rightPanelTab === t.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {rightPanelTab === "shot_info" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shot Title
                </label>
                <input
                  type="text"
                  value={activeStage.title}
                  onChange={(e) =>
                    updateStage(activeStage.id, { title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Shot Size
                  </label>
                  <select
                    value={activeStage.propertyValues?.shotsize || "Medium Shot"}
                    onChange={(e) =>
                      updateStageProperty(
                        activeStage.id,
                        "shotsize",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-[11px] bg-white"
                  >
                    <option value="Extreme Wide Shot">Extreme Wide Shot</option>
                    <option value="Wide Shot">Wide Shot</option>
                    <option value="Medium Shot">Medium Shot</option>
                    <option value="Close-Up">Close-Up</option>
                    <option value="Extreme Close-Up">Extreme Close-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Camera Angle
                  </label>
                  <select
                    value={activeStage.propertyValues?.cameraangle || "Eye Level"}
                    onChange={(e) =>
                      updateStageProperty(
                        activeStage.id,
                        "cameraangle",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-[11px] bg-white"
                  >
                    <option value="Eye Level">Eye Level</option>
                    <option value="High Angle">High Angle</option>
                    <option value="Low Angle">Low Angle</option>
                    <option value="Over the Shoulder">Over the Shoulder</option>
                    <option value="Bird's Eye">Bird&apos;s Eye</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Stage Background Color
                </label>
                <input
                  type="color"
                  value={activeStage.backgroundColor || "#FFFBEB"}
                  onChange={(e) =>
                    updateStage(activeStage.id, {
                      backgroundColor: e.target.value,
                    })
                  }
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Visual Detail / Action Notes
                </label>
                <textarea
                  rows={3}
                  value={activeStage.propertyValues?.visualdetail || ""}
                  onChange={(e) =>
                    updateStageProperty(
                      activeStage.id,
                      "visualdetail",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Shot Script Blocks ({(activeStage.scriptBlocks || []).length})
                </div>
                {(activeStage.scriptBlocks || []).slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-700"
                  >
                    <span className="font-mono uppercase text-[10px] text-blue-600 font-bold mr-1.5">
                      [{b.type}]
                    </span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightPanelTab === "layers" && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700">
                Stage Objects ({activeStage.canvasObjects.length})
              </div>
              {activeStage.canvasObjects.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No objects on this shot yet. Use the left toolbar to add characters,
                  backdrops, or speech bubbles.
                </p>
              ) : (
                activeStage.canvasObjects.map((obj, idx) => (
                  <div
                    key={obj.id}
                    data-testid={`canvas-layer-item-${idx + 1}`}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-1 cursor-pointer ${
                      obj.id === selectedObjectId
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-bold text-gray-900 truncate flex-1">
                      {obj.name}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        data-testid={`layer-up-btn-${idx + 1}`}
                        title="Bring forward"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderCanvasObject(obj.id, "up");
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        data-testid={`layer-down-btn-${idx + 1}`}
                        title="Send backward"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderCanvasObject(obj.id, "down");
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        data-testid={`layer-lock-btn-${idx + 1}`}
                        title={obj.locked ? "Unlock layer" : "Lock layer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCanvasObject(obj.id, { locked: !obj.locked });
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                      >
                        {obj.locked ? (
                          <Lock className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        data-testid={`layer-hide-btn-${idx + 1}`}
                        title={obj.hidden ? "Show layer" : "Hide layer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCanvasObject(obj.id, { hidden: !obj.hidden });
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                      >
                        {obj.hidden ? (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        data-testid={`layer-delete-btn-${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCanvasObject(obj.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {rightPanelTab === "properties" && (
            <div className="space-y-3">
              {!selectedObject ? (
                <p className="text-xs text-gray-400">
                  Select an object on the canvas stage to customize its text, pose,
                  colors, or transform.
                </p>
              ) : (
                <>
                  <div className="font-bold text-xs text-gray-900">
                    Editing: {selectedObject.name}
                  </div>
                  {(selectedObject.type === "speech_bubble" ||
                    selectedObject.type === "text") && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Dialogue / Caption Text
                      </label>
                      <textarea
                        rows={2}
                        data-testid="canvas-selected-object-text-input"
                        value={selectedObject.text || ""}
                        onChange={(e) =>
                          updateCanvasObject(selectedObject.id, {
                            text: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Opacity ({Math.round((selectedObject.opacity ?? 1) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={selectedObject.opacity ?? 1}
                      onChange={(e) =>
                        updateCanvasObject(selectedObject.id, {
                          opacity: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-testid="canvas-flip-x-btn"
                      onClick={() =>
                        updateCanvasObject(selectedObject.id, {
                          flipX: !selectedObject.flipX,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" /> Flip X
                    </button>
                    <button
                      type="button"
                      data-testid="canvas-flip-y-btn"
                      onClick={() =>
                        updateCanvasObject(selectedObject.id, {
                          flipY: !selectedObject.flipY,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <FlipVertical className="w-3.5 h-3.5" /> Flip Y
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCanvasObject(selectedObject.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {rightPanelTab === "comments" && (
            <div className="space-y-3">
              {/* Open / Resolved Filter matching 45-editor-right-panel-comments-tab.png */}
              <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  data-testid="comments-filter-open"
                  onClick={() => setCommentStatusFilter("open")}
                  className={`py-1 rounded-lg transition ${
                    commentStatusFilter === "open"
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Open (
                  {stageComments.filter((c) => !c.resolved).length})
                </button>
                <button
                  type="button"
                  data-testid="comments-filter-resolved"
                  onClick={() => setCommentStatusFilter("resolved")}
                  className={`py-1 rounded-lg transition ${
                    commentStatusFilter === "resolved"
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Resolved (
                  {stageComments.filter((c) => c.resolved).length})
                </button>
              </div>

              <form onSubmit={handlePostComment} className="space-y-2">
                <textarea
                  rows={2}
                  data-testid="canvas-comment-textarea"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Leave feedback on this shot..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
                <button
                  type="submit"
                  data-testid="canvas-comment-submit-btn"
                  className="w-full py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
                >
                  Post Comment
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {stageComments
                  .filter((c) =>
                    commentStatusFilter === "resolved"
                      ? Boolean(c.resolved)
                      : !c.resolved
                  )
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          #{idx + 1} {c.authorName}
                        </span>
                        <button
                          type="button"
                          data-testid={`comment-resolve-btn-${idx + 1}`}
                          onClick={async () => {
                            await fetch(`/api/projects/${project.id}/comments`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                commentId: c.id,
                                resolved: !c.resolved,
                              }),
                            });
                            refreshComments();
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {c.resolved ? "Reopen" : "Resolve"}
                        </button>
                      </div>
                      <p className="text-gray-600">{c.content}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
