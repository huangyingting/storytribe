"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import type { FullProjectData } from "@/types/storytribe";
import { ArrowLeft, Monitor } from "lucide-react";

export default function MobileEditorPage() {
  const { projectid } = useParams<{ projectid: string }>();
  const [project, setProject] = useState<FullProjectData | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/projects/${projectid}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProject(d?.project || null));
  }, [projectid]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white text-sm">
        Loading mobile storyboard viewer...
      </div>
    );
  }

  const activeStage = project.stages[activeIdx] || project.stages[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-4">
      <header className="flex items-center justify-between pb-3 border-b border-gray-800">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-xs font-bold truncate max-w-[180px]">
          {project.title}
        </div>
        <Link
          href={`/app/editor/${project.id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-[11px] font-bold"
        >
          <Monitor className="w-3 h-3" />
          Full Editor
        </Link>
      </header>

      <main className="my-auto py-6 space-y-4">
        {activeStage && (
          <>
            <StageMiniPreview
              width={project.width}
              height={project.height}
              backgroundColor={activeStage.backgroundColor}
              objects={activeStage.canvasObjects}
            />
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-1">
              <div className="text-xs font-bold text-blue-400">
                Shot #{activeIdx + 1} · {activeStage.durationSec}s
              </div>
              <div className="text-base font-extrabold">{activeStage.title}</div>
              <p className="text-xs text-gray-400">
                {activeStage.propertyValues?.visualdetail ||
                  "Tap Full Editor to illustrate or edit shot properties."}
              </p>
            </div>
          </>
        )}
      </main>

      <footer className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-gray-800">
        {project.stages.map((st, idx) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
              idx === activeIdx
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-gray-400"
            }`}
          >
            Shot #{idx + 1}
          </button>
        ))}
      </footer>
    </div>
  );
}
