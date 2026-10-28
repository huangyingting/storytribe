"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ASPECT_RATIOS } from "@/lib/catalog/storytribe-assets";
import {
  FileText,
  LayoutTemplate,
  Monitor,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "blank";

  const [tab, setTab] = useState<"blank" | "ai" | "import" | "template">(
    (["blank", "ai", "import", "template"].includes(initialTab)
      ? initialTab
      : "blank") as any
  );

  const [title, setTitle] = useState("Untitled Storyboard");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [aiPrompt, setAiPrompt] = useState(
    "A warm specialty coffee commercial showing a barista pouring latte art and a commuter smiling by the window"
  );
  const [visualLook, setVisualLook] = useState("classic");
  const [scriptText, setScriptText] = useState(
    "INT. COFFEE SHOP - MORNING\nSunlight streams across the wooden espresso bar.\nMAYA\nReady for your morning espresso?\nEXT. CITY SIDEWALK - MORNING\nCommuters walk past the cafe storefront."
  );
  const [templateId, setTemplateId] = useState("commercial");
  const [submitting, setSubmitting] = useState(false);

  const SUGGESTION_PROMPTS = [
    {
      label: "Try: car commercial",
      prompt:
        "A high-energy electric SUV commercial driving along a misty coastal highway at sunrise, cutting to close-ups of the driver and panoramic glass roof",
      title: "Coastal EV Commercial",
    },
    {
      label: "Try: indie film opening",
      prompt:
        "INT. DINER - NIGHT. Rain streaks the neon-lit window while two estranged siblings share a quiet booth over coffee and a map",
      title: "Midnight Diner Opening",
    },
    {
      label: "Try: music video",
      prompt:
        "A vibrant rooftop indie-pop music video at golden hour with synchronized choreography, wide city skyline shots, and dynamic whip pans",
      title: "Golden Hour Music Video",
    },
  ];

  const handleSelectRatio = (id: string) => {
    setSelectedRatio(id);
    const found = ASPECT_RATIOS.find((r) => r.id === id);
    if (found) {
      setCustomWidth(found.width);
      setCustomHeight(found.height);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const modeMap: Record<string, string> = {
      blank: "blank",
      ai: "ai-wizard",
      import: "import-script",
      template: "template",
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: modeMap[tab],
        title: title.trim() || "Untitled Storyboard",
        width: customWidth,
        height: customHeight,
        prompt: aiPrompt,
        scriptText,
        templateId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/app/editor/${data.project.id}`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
          What will you create today?
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Start with a script or idea for AI breakdown, or create manually from a blank canvas.
        </p>
      </div>

      {/* Quick Suggestion Pills (upstream 48-create-ai-script-wizard.png) */}
      <div className="flex flex-wrap items-center gap-2">
        {SUGGESTION_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setTab("ai");
              setTitle(item.title);
              setAiPrompt(item.prompt);
            }}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-gray-700 transition"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTab("import")}
          className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700"
        >
          + Upload script
        </button>
        <button
          type="button"
          onClick={() => setTab("blank")}
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 hover:underline"
        >
          I&apos;ll create manually from blank canvas
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "blank", label: "Blank Storyboard", icon: Monitor },
          { id: "ai", label: "AI Storyboard Wizard", icon: Sparkles },
          { id: "import", label: "Import Script", icon: FileText },
          { id: "template", label: "Production Template", icon: LayoutTemplate },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as any)}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
              tab === item.id
                ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Project Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Specialty Coffee Commercial"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Aspect Ratio & Custom Dimensions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Frame Aspect Ratio & Dimensions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRatio(r.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedRatio === r.id
                    ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-xs font-bold text-gray-900">{r.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {r.width}×{r.height}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500">
                Width (px, 200–6000)
              </label>
              <input
                type="number"
                min={200}
                max={6000}
                value={customWidth}
                onChange={(e) => {
                  setSelectedRatio("custom");
                  setCustomWidth(Number(e.target.value));
                }}
                className="mt-1 w-32 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500">
                Height (px, 200–6000)
              </label>
              <input
                type="number"
                min={200}
                max={6000}
                value={customHeight}
                onChange={(e) => {
                  setSelectedRatio("custom");
                  setCustomHeight(Number(e.target.value));
                }}
                className="mt-1 w-32 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {tab === "ai" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Story Concept / Prompt for Tribe AI
              </label>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm"
                placeholder="Start with a script or idea... We'll turn it into a visual storyboard you can edit and make your own."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Choose a look
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "classic", name: "Classic StoryTribe", desc: "Expressive 2D character line art" },
                  { id: "noir", name: "Cinematic Noir", desc: "High-contrast dramatic lighting" },
                  { id: "minimal", name: "Minimal Sketch", desc: "Clean storyboard pencil lines" },
                  { id: "editorial", name: "Warm Editorial", desc: "Full-color agency pitch boards" },
                ].map((look) => (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => setVisualLook(look.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      visualLook === look.id
                        ? "border-blue-600 bg-blue-50/70"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900">{look.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{look.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "import" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Screenplay / Fountain Text (INT./EXT. Scenes & Dialogue)
            </label>
            <textarea
              rows={6}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono"
            />
          </div>
        )}

        {tab === "template" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "commercial",
                name: "30s Brand Commercial",
                desc: "Hook, Product Reveal & Call-to-Action shots.",
              },
              {
                id: "short-film",
                name: "Narrative Film Scene",
                desc: "Establishing wide, over-the-shoulder & close-up coverage.",
              },
              {
                id: "ux-journey",
                name: "UX Customer Storyboard",
                desc: "Problem context, interaction beat & outcome frame.",
              },
            ].map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateId(tpl.id)}
                className={`p-4 rounded-xl border text-left ${
                  templateId === tpl.id
                    ? "border-blue-600 bg-blue-50/60"
                    : "border-gray-200"
                }`}
              >
                <div className="font-bold text-xs text-gray-900">{tpl.name}</div>
                <p className="text-[11px] text-gray-500 mt-1">{tpl.desc}</p>
              </button>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            data-testid="create-project-submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? "Creating Storyboard..." : "Create & Open Editor"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading project creator...</div>}>
      <CreateProjectContent />
    </Suspense>
  );
}
