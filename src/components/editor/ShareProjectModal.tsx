"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import { Copy, Check, Globe, Lock, UserPlus, X } from "lucide-react";

export function ShareProjectModal({ onClose }: { onClose: () => void }) {
  const { project, updateProjectMeta } = useEditor();
  const [guestEmail, setGuestEmail] = useState("");
  const [permission, setPermission] = useState("VIEW");
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && project.shareToken
      ? `${window.location.origin}/share/${project.shareToken}`
      : `/share/${project.shareToken}`;

  const handleTogglePublic = async (isPublic: boolean) => {
    const res = await fetch(`/api/projects/${project.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic }),
    });
    if (res.ok) {
      const data = await res.json();
      updateProjectMeta({
        isPublic: data.project.isPublic,
        shareToken: data.project.shareToken,
      });
    }
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    await fetch(`/api/projects/${project.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestEmail: guestEmail.trim(),
        permission,
      }),
    });
    setGuestEmail("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="share-project-modal"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-950">
              Share &quot;{project.title}&quot;
            </h3>
            <p className="text-xs text-gray-500">
              Invite collaborators or enable a read-only public review link.
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

        {/* Invite Collaborator by Email */}
        <form onSubmit={handleInviteGuest} className="flex gap-2">
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Invite collaborator by email..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-gray-300 text-xs bg-white"
          >
            <option value="VIEW">Can view</option>
            <option value="COMMENT">Can comment</option>
            <option value="EDIT">Can edit</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold inline-flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite
          </button>
        </form>

        {/* Link Access Control */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {project.isPublic ? (
                <Globe className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {project.isPublic
                    ? "Anyone with the link can view"
                    : "Restricted — Only invited people"}
                </div>
                <div className="text-[11px] text-gray-500">
                  Toggle public read-only storyboard access
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="toggle-public-share-btn"
              onClick={() => handleTogglePublic(!project.isPublic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                project.isPublic
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              {project.isPublic ? "Public Enabled" : "Enable Public Link"}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-600"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold inline-flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
