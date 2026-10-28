"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";
import { Search, Heart, Bookmark, Film, Sparkles, SlidersHorizontal } from "lucide-react";

type SortOption = "trending" | "newest" | "most_liked";
type FormatFilter = "all" | "storyboards" | "videos" | "books";

export default function CommunityExplorePage() {
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?scope=community")
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSave = async (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id }),
    }).catch(() => {});
  };

  const filtered = projects.filter((p) => {
    if (
      searchQuery.trim() &&
      !`${p.title} ${p.synopsis || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (format === "videos") return Boolean(p.videoShareToken);
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Community Explore
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1">
              Explore Community Storyboards & Animatics
            </h1>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community storyboards..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            {(
              [
                { id: "all", label: "All" },
                { id: "storyboards", label: "Storyboards" },
                { id: "videos", label: "Videos" },
                { id: "books", label: "Books" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormat(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  format === tab.id
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Sort by:</span>
            {(
              [
                { id: "trending", label: "Trending" },
                { id: "newest", label: "Newest" },
                { id: "most_liked", label: "Most liked" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortBy(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sortBy === s.id
                    ? "bg-gray-950 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading community gallery...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
            <Film className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="text-sm font-bold text-gray-900">
              No matching community projects found
            </div>
            <p className="text-xs text-gray-500">
              Try switching filters or publish a storyboard from the editor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {p.aspectRatio || "16:9"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleLike(p.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          likedIds.includes(p.id)
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                        title="Like storyboard"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSave(p.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          savedIds.includes(p.id)
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                        title="Save to Bookmarks"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {p.synopsis || "StoryTribe visual storyboard project"}
                  </p>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>{p.stages?.length || 1} shot(s)</span>
                  <Link
                    href={`/app/editor/${p.id}`}
                    className="font-bold text-gray-900 hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
