"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, Plus, ArrowRight } from "lucide-react";

export default function EditorIndexPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const list = data.projects || [];
        setProjects(list);
        if (list.length > 0) {
          router.replace(`/app/editor/${list[0].id}`);
          return;
        }
      }
      setLoading(false);
    }
    load();
  }, [router]);

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Clapperboard className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-gray-950">
          {loading ? "Opening Storyboard Editor..." : "No active storyboard yet"}
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          {projects.length > 0
            ? "Redirecting to your most recent storyboard project..."
            : "Create a new storyboard from a blank canvas, AI script breakdown, or production template."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/app/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Create Storyboard
          </Link>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go to Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
