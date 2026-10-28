"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FullProjectData } from "@/types/storytribe";
import { StageMiniPreview } from "@/components/canvas/SvgAssetRenderer";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";
import NotFound from "@/app/not-found";
import { MessageSquare, Send } from "lucide-react";

export default function PublicShareStoryboardPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<FullProjectData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [bgTheme, setBgTheme] = useState("#FBF9F5");
  const [presentIdx, setPresentIdx] = useState<number | null>(null);

  const SHARE_THEMES = [
    { name: "Default", hex: "#FBF9F5" },
    { name: "White", hex: "#fafafa" },
    { name: "Dark", hex: "#24222e" },
    { name: "Lilac", hex: "#C4B5FD" },
    { name: "Periwinkle", hex: "#A5B4FC" },
    { name: "Mint", hex: "#BBF7D0" },
    { name: "Butter", hex: "#FEF08A" },
    { name: "Apricot", hex: "#FDBA74" },
    { name: "Blush", hex: "#FECDD3" },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/share/${encodeURIComponent(token)}`);
      if (!res.ok) {
        setNotFound(true);
      } else {
        const data = await res.json();
        setProject(data.project);
      }
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) {
    return <div className="p-16 text-center text-sm text-gray-500">Loading shared storyboard...</div>;
  }

  if (notFound || !project) {
    return <NotFound />;
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch(`/api/projects/${project.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentText.trim(),
        authorName: authorName.trim() || "Guest Reviewer",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProject({
        ...project,
        comments: [...project.comments, data.comment],
      });
      setCommentText("");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      style={{ backgroundColor: bgTheme }}
    >
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <StoryTribeLogo href="/" size="sm" />
          <span className="text-gray-300">|</span>
          <div>
            <h1 className="text-base font-bold text-gray-900">{project.title}</h1>
            <p className="text-xs text-gray-500">
              Shared Storyboard · {project.stages.length} shot(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {SHARE_THEMES.map((t) => (
              <button
                key={t.name}
                type="button"
                title={`Theme: ${t.name}`}
                onClick={() => setBgTheme(t.hex)}
                className={`w-5 h-5 rounded-full border ${
                  bgTheme === t.hex ? "ring-2 ring-blue-600 border-white" : "border-gray-300"
                }`}
                style={{ backgroundColor: t.hex }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPresentIdx(0)}
            className="px-3 py-1.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            Present
          </button>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            {project.shareAccess === "comment" ? "Can comment" : "View only"}
          </span>
        </div>
      </header>

      {presentIdx !== null && project.stages[presentIdx] && (
        <div className="fixed inset-0 z-50 bg-gray-950/95 text-white flex flex-col items-center justify-center p-6 gap-5">
          <div className="w-full max-w-4xl">
            <StageMiniPreview stage={project.stages[presentIdx]} />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPresentIdx(Math.max(0, presentIdx - 1))}
              className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-bold"
            >
              Prev
            </button>
            <span className="text-xs font-mono">
              Shot {presentIdx + 1} / {project.stages.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setPresentIdx(Math.min(project.stages.length - 1, presentIdx + 1))
              }
              className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-bold"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPresentIdx(null)}
              className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {project.synopsis && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-xs font-bold uppercase text-gray-400">
                Story Synopsis
              </div>
              <p className="mt-1 text-sm text-gray-700">{project.synopsis}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.stages.map((st, idx) => (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Shot 1.{idx + 1}</span>
                  <span>
                    {(st.annotations || st.propertyValues || {}).shotsize ||
                      "Medium Shot"}
                  </span>
                </div>
                <StageMiniPreview stage={st} />
                <div className="font-bold text-sm text-gray-900">{st.title}</div>
                <p className="text-xs text-gray-600">
                  {(st.scriptBlocks || []).map((b) => b.text).join(" ") ||
                    (st.annotations || st.propertyValues || {}).visualdetail ||
                    ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Review Comments Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Review Comments ({project.comments.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {project.comments.length === 0 ? (
                <p className="text-xs text-gray-400">No comments yet.</p>
              ) : (
                project.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1"
                  >
                    <div className="font-bold text-gray-900">{cm.authorName}</div>
                    <p className="text-gray-700">{cm.content}</p>
                  </div>
                ))
              )}
            </div>

            {project.shareAccess === "comment" && (
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add feedback on this storyboard..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
