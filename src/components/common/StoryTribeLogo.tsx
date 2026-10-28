"use client";

import React from "react";
import Link from "next/link";

export function StoryTribeLogo({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = size === "sm" ? 0.85 : size === "lg" ? 1.15 : 1;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 select-none group focus:outline-none"
      aria-label="StoryTribe"
    >
      <svg
        width={Math.round(92 * scale)}
        height={Math.round(38 * scale)}
        viewBox="0 0 120 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-[1.02]"
      >
        <text
          x="2"
          y="22"
          fill="#111111"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="23"
          letterSpacing="-0.5"
        >
          Story
        </text>
        <text
          x="18"
          y="42"
          fill="#111111"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="23"
          letterSpacing="-0.5"
        >
          Tribe
        </text>
        <path
          d="M78 10 C86 6, 96 12, 92 20 C88 26, 80 22, 85 15"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </Link>
  );
}
