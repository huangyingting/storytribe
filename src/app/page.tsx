import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  Layers,
  Users,
  Wand2,
  Play,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  FileText,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";
import { CharacterRigSvg } from "@/components/canvas/SvgAssetRenderer";
import { CHARACTER_PRESETS } from "@/lib/catalog/storytribe-assets";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FBF9F5] to-white pt-16 pb-24 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              StoryTribe v3.4 · Storyboarding, Scriptwriting & Video Animatics
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 max-w-4xl mx-auto leading-[1.1]">
              Storyboarding for everyone—no drawing skills required.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Write your script, customize expressive illustrated characters, build visual
              storyboards, manage shot lists, and turn frames into timed video animatics in
              one unified studio workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gray-950 text-white text-base font-bold hover:bg-gray-800 transition shadow-sm"
              >
                Start Storyboarding
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-base font-semibold hover:bg-gray-50 transition"
              >
                Explore All 6 Editor Modes
              </Link>
            </div>

            {/* Interactive Showcase Preview Card */}
            <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden text-left">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-gray-900 font-bold">
                    Specialty Coffee Commercial
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Story Bible
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Script
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Storyboard
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white">
                    Canvas
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Table
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Video
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#FBF9F5]">
                {CHARACTER_PRESETS.slice(0, 3).map((char, idx) => (
                  <div
                    key={char.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                      <span>SHOT 1.{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {idx === 0 ? "Wide Shot (WS)" : idx === 1 ? "Medium Shot (MS)" : "Close-Up (CU)"}
                      </span>
                    </div>
                    <div className="h-48 bg-amber-50/60 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                      <div className="w-28 h-44">
                        <CharacterRigSvg rig={char.rig} />
                      </div>
                    </div>
                    <h3 className="mt-3 font-bold text-sm text-gray-900">
                      {char.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Customizable pose, facial expression, outfit, view angle & props.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6 Unified Modes Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-gray-950">
                One Project. Six Synchronized Pre-Production Views.
              </h2>
              <p className="mt-3 text-gray-600">
                Every change to a scene, shot, character, or camera property updates
                automatically across the entire production pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "1. Story Bible",
                  desc: "Define your project synopsis with AI summarization, cover aesthetics, and consistent @Characters, @Props, and @Backgrounds.",
                },
                {
                  icon: FileText,
                  title: "2. Script Writer",
                  desc: "Write screenplay scenes and shot-level action, character cues, and dialogue—or import Fountain/text scripts directly.",
                },
                {
                  icon: LayoutGrid,
                  title: "3. Storyboard Grid",
                  desc: "Organize shots in 2–8 columns, filter by @element or #scene, assign camera angles & movements, and reorder frames.",
                },
                {
                  icon: Layers,
                  title: "4. 2D Vector/AI Canvas",
                  desc: "Pose customizable StoryTribe characters, sketch freehand with inertia brushes, add speech bubbles, and generate with Tribe AI.",
                },
                {
                  icon: Table2,
                  title: "5. Production Shot List Table",
                  desc: "Spreadsheet view grouped by scene with inline editing for Visual Detail, Camera Angle, Shot Size, Movement, and custom fields.",
                },
                {
                  icon: Play,
                  title: "6. Video Animatic NLE",
                  desc: "Convert storyboard frames into a multi-track timeline with transitions, AI voiceover/TTS tracks, background music, and video export.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 bg-[#FBF9F5] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                <Wand2 className="w-3.5 h-3.5" />
                Character Builder + Tribe AI
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
                Thousands of character combinations & instant export layouts
              </h2>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "Customize pose, expression, outfit, hairstyle, skin tone, and 4 camera angles (Front, 3/4, Side, Back).",
                  "Freehand sketch brush with Normal, Inertia, Dashed, and Dotted stroke modes.",
                  "Anchor frame-accurate comment pins anywhere on the canvas for client & crew reviews.",
                  "Export to PDF, PPTX, PNG, CSV, and JSON across 6 industry-standard storyboard & shot-list layouts.",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/login-signup"
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                >
                  Sign In with Invitation
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  View Plans
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Film className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-bold text-gray-900">6 Export Presets</div>
                <p className="text-xs text-gray-500 mt-1">
                  One shot per page, 3 per page, Grid overview, Images only, Screenplay, and Shot List Table.
                </p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-bold text-gray-900">Studio Workspaces</div>
                <p className="text-xs text-gray-500 mt-1">
                  Collaborate with team members, share @Elements, and review comments in real time.
                </p>
              </div>
              <div className="col-span-2 p-6 bg-gray-950 text-white rounded-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Enterprise Security
                </div>
                <div className="text-lg font-bold mt-1">
                  Invite-Only Account Admission & Audit Trail
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Single-use cryptographically hashed invitation links, role-based access control
                  (USER & ADMIN), instant token revocation/rotation, and full security audit logs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
