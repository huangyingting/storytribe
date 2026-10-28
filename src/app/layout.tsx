import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "StoryTribe — Storyboarding, Scriptwriting & Animatics for Everyone",
  description:
    "Create professional storyboards, scripts, shot lists, and video animatics in minutes with customizable characters, scenes, props, and Tribe AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
