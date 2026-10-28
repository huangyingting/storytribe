"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function AiHistoryPage() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/generate")
      .then((r) => (r.ok ? r.json() : { generations: [] }))
      .then((d) => {
        setGenerations(d.generations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Tribe AI Generation History
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete log of AI-synthesized storyboard shots, scripts, synopses, and
          voiceovers.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400">
          Loading AI generation log...
        </div>
      ) : generations.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          No AI generations recorded yet. Use Tribe AI inside the Storyboard Editor to
          generate shots, scripts, or synopses.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {generations.map((g) => (
            <div
              key={g.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold">
                    {g.generationType}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {g.model} · {g.style}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {g.prompt}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                -{g.creditsUsed} credit · {new Date(g.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
