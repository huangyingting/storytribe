"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : { savedItems: [] }))
      .then((d) => setSavedItems(d.savedItems || []));
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-blue-600" />
          Saved Storyboards
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Bookmarked storyboards and references for your upcoming productions.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          You have not bookmarked any storyboards yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((item) => (
            <Link
              key={item.id}
              href={`/app/editor/${item.project.id}`}
              className="p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition"
            >
              <div className="font-bold text-sm text-gray-900">
                {item.project.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                By {item.project.owner?.name || "Creator"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
