"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StoryboardEditorShell } from "@/components/editor/StoryboardEditorShell";
import type { FullProjectData } from "@/types/storytribe";

export default function ProjectEditorPage() {
  const { projectid } = useParams<{ projectid: string }>();
  const [project, setProject] = useState<FullProjectData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectid}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Could not load storyboard project.");
        }
        return res.json();
      })
      .then((data) => setProject(data.project))
      .catch((err) => setError(err.message));
  }, [projectid]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2 max-w-md">
          <div className="font-bold text-gray-900">{error}</div>
          <a
            href="/app/dashboard"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-500">
        Opening Storyboard Editor...
      </div>
    );
  }

  return <StoryboardEditorShell initialProject={project} />;
}
