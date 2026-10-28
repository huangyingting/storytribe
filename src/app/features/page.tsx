import React from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  Layers,
  Table2,
  Video,
  Sparkles,
  UserCheck,
  PenTool,
  Share2,
  Download,
} from "lucide-react";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";

export default function FeaturesPage() {
  const features = [
    {
      icon: BookOpen,
      badge: "Mode 1",
      title: "Story Bible & Consistent @Elements",
      desc: "Centralize your project logline, AI-generated synopsis, cover banner palette, and reusable @Character, @Prop, and @Background cards.",
    },
    {
      icon: FileText,
      badge: "Mode 2",
      title: "Screenplay & Shot Script Writer",
      desc: "Author scene-by-scene scripts with Action, Character, Dialogue, Parenthetical, and Transition blocks—or import Fountain/text scripts.",
    },
    {
      icon: LayoutGrid,
      badge: "Mode 3",
      title: "Visual Storyboard Grid",
      desc: "Switch between Compact and 2–8 column layouts, filter by @element or #scene, assign camera angles & movements, and reorder shots effortlessly.",
    },
    {
      icon: Layers,
      badge: "Mode 4",
      title: "Interactive 2D Canvas & Layer Inspector",
      desc: "Combine illustrated characters, props, backgrounds, speech/thought bubbles, geometric shapes, rule-of-thirds frames, and comment pins.",
    },
    {
      icon: Table2,
      badge: "Mode 5",
      title: "Production Shot List Table",
      desc: "Spreadsheet-style shot breakdown grouped by scene with customizable property columns (Text, Select, Multi-select, Number, Checkbox, Person, Media).",
    },
    {
      icon: Video,
      badge: "Mode 6",
      title: "Multi-Track Video Animatic NLE",
      desc: "Turn storyboard shots into timed animatics with frame transitions (Fade, Dissolve, Wipe), voiceover/TTS tracks, and background music lanes.",
    },
    {
      icon: UserCheck,
      badge: "Character Rigging",
      title: "Customizable StoryTribe Characters",
      desc: "Mix and match poses, facial expressions, outfits, hairstyles, skin tones, and 4 camera angles (Front, 3/4, Side, Back) in seconds.",
    },
    {
      icon: PenTool,
      badge: "Vector Sketching",
      title: "Freehand Sketch & Inertia Brushes",
      desc: "Draw directly on the canvas with Normal, Inertia, Dashed, and Dotted brush styles, custom stroke widths, color palettes, and an Eraser.",
    },
    {
      icon: Sparkles,
      badge: "Tribe AI",
      title: "Tribe AI Shot & Script Synthesis",
      desc: "Generate storyboard frames, expand scene dialogue, summarize synopses, and synthesize timed voiceovers with full credit history.",
    },
    {
      icon: Share2,
      badge: "Collaboration",
      title: "Live Share Links & Anchored Comments",
      desc: "Share storyboards via public view/comment tokens, invite workspace collaborators, and resolve pinned canvas feedback threads.",
    },
    {
      icon: Download,
      badge: "Multi-Format Export",
      title: "6 Industry-Standard Export Layouts",
      desc: "Export One shot per page, Storyboard 3 per page, Grid overview, Images only, Screenplay, or Shot List Table in PDF, PPTX, PNG, CSV, or JSON.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Platform Capabilities
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-950">
              Built for every stage of visual pre-production
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              From initial concept and screenplay to client-ready storyboards, shot lists,
              and video animatics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {f.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{f.title}</h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/app/create"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              Launch Storyboard Editor
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
