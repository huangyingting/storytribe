import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/common/PublicHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="text-center max-w-md space-y-4">
          <div className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            404
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Page not found
          </h1>
          <p className="text-sm text-gray-500">
            Sorry, we couldn&apos;t find the page you were looking for.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Back to home
            </Link>
          </div>
        </div>

        {/* Custom StoryTribe 404 Line-Art Character Pair */}
        <div className="w-72 h-80 flex items-center justify-center">
          <svg viewBox="0 0 320 360" className="w-full h-full">
            <text x="30" y="65" fontSize="28" fontWeight="800" fill="#111827">
              ??
            </text>
            <text x="255" y="75" fontSize="28" fontWeight="800" fill="#111827">
              ??
            </text>
            {/* Left Character */}
            <circle
              cx="110"
              cy="75"
              r="26"
              fill="#ffffff"
              stroke="#111827"
              strokeWidth="3"
            />
            <path
              d="M84 75 C84 45, 136 45, 136 75"
              fill="#111827"
            />
            <circle cx="102" cy="75" r="2.5" fill="#111827" />
            <circle cx="118" cy="75" r="2.5" fill="#111827" />
            <path
              d="M104 86 Q110 82 116 86"
              stroke="#111827"
              strokeWidth="2.5"
              fill="none"
            />
            <rect
              x="80"
              y="105"
              width="60"
              height="90"
              rx="12"
              fill="#111827"
            />
            <text
              x="110"
              y="148"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontStyle="italic"
              fontWeight="700"
            >
              StoryTribe
            </text>
            <line
              x1="92"
              y1="195"
              x2="86"
              y2="310"
              stroke="#111827"
              strokeWidth="3"
            />
            <line
              x1="128"
              y1="195"
              x2="134"
              y2="310"
              stroke="#111827"
              strokeWidth="3"
            />
            {/* Right Character */}
            <circle
              cx="210"
              cy="70"
              r="26"
              fill="#ffffff"
              stroke="#111827"
              strokeWidth="3"
            />
            <circle cx="202" cy="70" r="2.5" fill="#111827" />
            <circle cx="218" cy="70" r="2.5" fill="#111827" />
            <rect
              x="180"
              y="100"
              width="62"
              height="95"
              rx="14"
              fill="#ffffff"
              stroke="#111827"
              strokeWidth="3"
            />
            <text
              x="211"
              y="148"
              textAnchor="middle"
              fill="#111827"
              fontSize="12"
              fontStyle="italic"
              fontWeight="700"
            >
              StoryTribe
            </text>
            <line
              x1="195"
              y1="195"
              x2="190"
              y2="310"
              stroke="#111827"
              strokeWidth="3"
            />
            <line
              x1="228"
              y1="195"
              x2="236"
              y2="310"
              stroke="#111827"
              strokeWidth="3"
            />
          </svg>
        </div>
      </main>
    </div>
  );
}
