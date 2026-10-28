"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FullProjectData } from "@/types/storytribe";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";
import NotFound from "@/app/not-found";
import { Play, Pause, RotateCcw, Heart, Bookmark, Eye } from "lucide-react";

export default function PublicVideoSharePage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params?.shareToken || "";

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<FullProjectData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [views, setViews] = useState(1);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/share/${encodeURIComponent(shareToken)}`);
      if (!res.ok) {
        setNotFound(true);
      } else {
        const data = await res.json();
        setProject(data.project);
      }
      setLoading(false);
    }
    if (shareToken) load();
  }, [shareToken]);

  useEffect(() => {
    if (!playing || !project || project.stages.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        if (prev + 1 >= project.stages.length) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [playing, project]);

  if (loading) {
    return <div className="p-16 text-center text-sm text-gray-500">Loading shared animatic...</div>;
  }

  if (notFound || !project) {
    return <NotFound />;
  }

  const currentStage = project.stages[activeIdx] || project.stages[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white px-2.5 py-1 rounded-lg">
            <StoryTribeLogo href="/" size="sm" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{project.title} — Animatic</h1>
            <p className="text-xs text-gray-400">
              Shot {activeIdx + 1} of {project.stages.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
            <Eye className="w-3.5 h-3.5" />
            {views} view{views === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              liked
                ? "bg-rose-600 border-rose-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            {liked ? "Liked (1)" : "Like"}
          </button>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              saved
                ? "bg-amber-500 border-amber-400 text-gray-950"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-full max-w-4xl">
          {currentStage && <StageMiniPreview stage={currentStage} />}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setActiveIdx(0);
            }}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            className="p-4 rounded-full bg-white text-gray-950 hover:bg-gray-200"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </main>
    </div>
  );
}
