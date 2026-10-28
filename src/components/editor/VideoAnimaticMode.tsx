"use client";

import React, { useEffect, useState } from "react";
import { useEditor } from "./EditorContext";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import {
  Film,
  Play,
  Pause,
  Volume2,
  Music,
  Sparkles,
  Plus,
} from "lucide-react";

export function VideoAnimaticMode() {
  const { project, updateProjectMeta } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [ttsPrompt, setTtsPrompt] = useState(
    "Welcome to our new product story!"
  );

  const videoProject = project.videoProject;

  const handleInitializeVideo = () => {
    const frames = project.stages.map((st, idx) => ({
      id: `vframe_${idx + 1}`,
      stageId: st.id,
      durationSec: st.durationSec || 3,
      transition: "NONE" as const,
      transitionDur: 0.5,
    }));

    updateProjectMeta({
      videoProject: {
        id: `vp_${Date.now()}`,
        isInitialized: true,
        fps: 24,
        aspectRatio: project.aspectRatio || "16:9",
        frames,
        voiceoverTracks: [],
        musicTracks: [
          {
            id: "music_1",
            name: "Upbeat Studio Acoustic Bed",
            startTimeSec: 0,
            durationSec: frames.reduce((s, f) => s + f.durationSec, 0),
            volume: 0.6,
          },
        ],
      },
    });
  };

  const totalDuration = (videoProject?.frames || []).reduce(
    (sum, f) => sum + (f.durationSec || 3),
    0
  );

  useEffect(() => {
    if (!isPlaying || !videoProject?.isInitialized) return;
    const timer = setInterval(() => {
      setPlayheadSec((prev) => {
        const next = Number((prev + 0.2).toFixed(1));
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [isPlaying, videoProject?.isInitialized, totalDuration]);

  useEffect(() => {
    if (!videoProject?.frames?.length) return;
    let acc = 0;
    for (let i = 0; i < videoProject.frames.length; i++) {
      acc += videoProject.frames[i].durationSec;
      if (playheadSec <= acc) {
        setActiveFrameIdx(i);
        return;
      }
    }
  }, [playheadSec, videoProject]);

  // 1. Onboarding Empty State matching 35-editor-video-animatic.png
  if (!videoProject || !videoProject.isInitialized) {
    return (
      <div
        data-testid="editor-mode-video-onboarding"
        className="max-w-3xl mx-auto p-10 text-center space-y-6"
      >
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950">
            Turn your storyboard into a Video Animatic
          </h2>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Automatically import all {project.stages.length} storyboard shot(s) into a
            multi-track timeline with frame timing, camera transitions, AI voiceover, and
            background music.
          </p>
          <button
            type="button"
            onClick={handleInitializeVideo}
            data-testid="create-video-animatic-btn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 transition"
          >
            <Sparkles className="w-4 h-4" />
            Create video
          </button>
        </div>
      </div>
    );
  }

  const currentFrame =
    videoProject.frames[activeFrameIdx] || videoProject.frames[0];
  const currentStage =
    project.stages.find((s) => s.id === currentFrame?.stageId) ||
    project.stages[0];

  const handleAddVoiceover = () => {
    if (!ttsPrompt.trim()) return;
    const nextTracks = [
      ...(videoProject.voiceoverTracks || []),
      {
        id: `vo_${Date.now()}`,
        name: `AI Voiceover: "${ttsPrompt.slice(0, 28)}..."`,
        startTimeSec: playheadSec,
        durationSec: 3,
        voiceId: "Nova (Warm Narrator)",
        scriptText: ttsPrompt,
        volume: 1,
      },
    ];
    updateProjectMeta({
      videoProject: {
        ...videoProject,
        voiceoverTracks: nextTracks,
      },
    });
  };

  // 2. Active Multi-Track NLE Timeline matching 38-editor-video-timeline-active.png
  return (
    <div
      data-testid="editor-mode-video-timeline"
      className="h-[calc(100vh-56px)] flex flex-col bg-[#0F172A] text-white"
    >
      {/* Top Preview Monitor & Voiceover Generator */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-4">
          <div className="w-full max-w-xl">
            {currentStage && (
              <StageMiniPreview
                width={project.width}
                height={project.height}
                backgroundColor={currentStage.backgroundColor}
                objects={currentStage.canvasObjects}
              />
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              data-testid="video-play-toggle-btn"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 inline-flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Play Animatic
                </>
              )}
            </button>
            <span className="font-mono text-xs text-slate-300">
              {playheadSec.toFixed(1)}s / {totalDuration.toFixed(1)}s · Shot #
              {activeFrameIdx + 1}
            </span>
          </div>
        </div>

        {/* Voiceover & Transition Controls */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Voiceover & Audio Tracks
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Text-to-Speech Narration Line
            </label>
            <textarea
              rows={2}
              value={ttsPrompt}
              onChange={(e) => setTtsPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
          <button
            type="button"
            data-testid="video-add-voiceover-btn"
            onClick={handleAddVoiceover}
            className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />+ Add AI Voiceover Track
          </button>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Frame #{activeFrameIdx + 1} Timing & Transition
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Transition
                </label>
                <select
                  data-testid="video-transition-select"
                  value={currentFrame?.transition || "NONE"}
                  onChange={(e) => {
                    const updatedFrames = videoProject.frames.map((f, i) =>
                      i === activeFrameIdx
                        ? { ...f, transition: e.target.value as any }
                        : f
                    );
                    updateProjectMeta({
                      videoProject: { ...videoProject, frames: updatedFrames },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="NONE">Cut (None)</option>
                  <option value="CROSSFADE">Crossfade</option>
                  <option value="FADE_BLACK">Dip to Black</option>
                  <option value="WIPE_LEFT">Wipe Left</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Duration (sec)
                </label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  data-testid="video-frame-duration-input"
                  value={currentFrame?.durationSec || 3}
                  onChange={(e) => {
                    const dur = Number(e.target.value) || 3;
                    const updatedFrames = videoProject.frames.map((f, i) =>
                      i === activeFrameIdx ? { ...f, durationSec: dur } : f
                    );
                    updateProjectMeta({
                      videoProject: { ...videoProject, frames: updatedFrames },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Multi-Track Timeline */}
      <div className="h-56 bg-slate-950 border-t border-slate-800 p-4 space-y-3 overflow-x-auto shrink-0">
        {/* Track 1: Storyboard Frames */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Film className="w-3.5 h-3.5 text-blue-400" /> Frames
          </div>
          <div className="flex items-center gap-2">
            {videoProject.frames.map((frame, idx) => {
              const st = project.stages.find((s) => s.id === frame.stageId);
              return (
                <div
                  key={frame.id}
                  onClick={() => setActiveFrameIdx(idx)}
                  className={`px-3 py-2 rounded-xl border text-xs cursor-pointer shrink-0 ${
                    idx === activeFrameIdx
                      ? "border-blue-500 bg-blue-950/60"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="font-bold">
                    #{idx + 1} {st?.title || "Shot"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {frame.durationSec}s · {frame.transition}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Voiceover Clips */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Voiceover
          </div>
          <div className="flex items-center gap-2">
            {(videoProject.voiceoverTracks || []).length === 0 ? (
              <span className="text-xs text-slate-600">
                No voiceover clips yet.
              </span>
            ) : (
              videoProject.voiceoverTracks.map((vo) => (
                <div
                  key={vo.id}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-700 text-xs text-purple-200"
                >
                  {vo.name} ({vo.durationSec}s)
                </div>
              ))
            )}
          </div>
        </div>

        {/* Track 3: Music Bed */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Music className="w-3.5 h-3.5 text-emerald-400" /> Music
          </div>
          <div className="flex items-center gap-2">
            {(videoProject.musicTracks || []).map((m) => (
              <div
                key={m.id}
                className="px-4 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200"
              >
                {m.name} ({totalDuration}s)
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
