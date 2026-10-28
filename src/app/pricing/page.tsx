"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      desc: "For individuals exploring visual storytelling and quick storyboards.",
      price: "$0",
      period: "forever",
      cta: "Get Started",
      highlight: false,
      features: [
        "Up to 3 active storyboard projects",
        "All 6 Editor Modes (Bible, Script, Grid, Canvas, Table, Video)",
        "Standard Character Builder & Props catalog",
        "PDF & PNG Storyboard Export",
      ],
    },
    {
      name: "Creator Pro",
      desc: "For filmmakers, video producers, and creative professionals.",
      price: annual ? "$12" : "$16",
      period: "per user / month",
      cta: "Start Creator Pro",
      highlight: true,
      features: [
        "Unlimited storyboard projects & shots",
        "Full Character Builder (all outfits, expressions & 4 angles)",
        "100 monthly Tribe AI generation credits",
        "Multi-track Video Animatics NLE & voiceover synthesis",
        "All 6 Export layouts (PDF, PPTX, PNG, CSV, JSON)",
        "Custom Shot Properties & Reusable @Elements",
      ],
    },
    {
      name: "Studio / Business",
      desc: "For production houses, agencies, and collaborative creative teams.",
      price: annual ? "$29" : "$39",
      period: "per seat / month",
      cta: "Setup Studio Workspace",
      highlight: false,
      features: [
        "Everything in Creator Pro",
        "Shared Studio Workspaces & team member roles",
        "Shared @Character, @Prop & @Background libraries",
        "Invite-Only Account Admission & Admin Audit Logs",
        "Priority rendering & dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 py-16 bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-950">
              Simple, transparent pricing for every storyteller
            </h1>
            <p className="mt-3 text-gray-600">
              Choose the plan that fits your production workflow.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl bg-gray-200/80">
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                Annual Billing (Save 25%)
              </button>
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  !annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 flex flex-col border ${
                  p.highlight
                    ? "bg-gray-950 text-white border-gray-900 shadow-xl ring-2 ring-blue-500"
                    : "bg-white text-gray-900 border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  {p.highlight && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                      Most Popular
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-xs ${
                    p.highlight ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {p.desc}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span
                    className={`text-xs ${
                      p.highlight ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          p.highlight ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/app/dashboard"
                  className={`mt-8 w-full py-3 rounded-xl text-center text-sm font-bold transition ${
                    p.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
