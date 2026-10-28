import React from "react";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";

export default function HelpPage() {
  const shortcuts = [
    { key: "Ctrl / Cmd + Z", desc: "Undo last editor action (50-step stack)" },
    { key: "Ctrl / Cmd + Y", desc: "Redo editor action" },
    { key: "Ctrl / Cmd + S", desc: "Save project immediately to cloud" },
    { key: "V", desc: "Activate Select cursor tool" },
    { key: "B", desc: "Activate Sketch / Freehand brush tool" },
    { key: "C", desc: "Activate Comment Pin tool" },
    { key: "Delete / Backspace", desc: "Delete selected canvas layer(s)" },
    { key: "Ctrl / Cmd + D", desc: "Duplicate selected canvas layer" },
    { key: "Space + Drag", desc: "Pan around the 2D canvas stage" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              StoryTribe Help Center & Documentation
            </h1>
            <p className="mt-2 text-gray-600">
              Quick-start guides, keyboard shortcuts, and answers to common questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                How Invite-Only Registration Works
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                This StoryTribe workspace enforces invite-only admission. An administrator
                issues a single-use invitation link (<code className="text-xs bg-white px-1.5 py-0.5 rounded border">/invite/&lt;token&gt;</code>)
                bound to your email address. Once redeemed, the link cannot be reused.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Working Across the 6 Editor Modes
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Start in <strong>Story Bible</strong> or <strong>Script</strong> to outline
                your scenes, switch to <strong>Storyboard</strong> or <strong>Canvas</strong> to
                illustrate frames with customizable characters, review metadata in{" "}
                <strong>Table</strong>, and assemble timed animatics in <strong>Video</strong>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-950 text-white px-6 py-4 font-bold text-sm">
              Editor Keyboard Shortcuts Reference
            </div>
            <div className="divide-y divide-gray-200">
              {shortcuts.map((s) => (
                <div
                  key={s.key}
                  className="px-6 py-3.5 flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">{s.desc}</span>
                  <kbd className="px-2.5 py-1 rounded bg-gray-100 border border-gray-300 font-mono text-xs font-bold text-gray-900">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
