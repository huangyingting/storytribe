import React from "react";
import Link from "next/link";
import { StoryTribeLogo } from "./StoryTribeLogo";

export function PublicFooter() {
  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="bg-white inline-block px-3 py-1.5 rounded-lg">
              <StoryTribeLogo href="/" size="sm" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Visual storytelling, scriptwriting, storyboarding & animatics for film directors,
              producers, marketers, and creative teams.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-white">
                  6-Mode Storyboard Editor
                </Link>
              </li>
              <li>
                <Link href="/features#characters" className="hover:text-white">
                  Character Builder
                </Link>
              </li>
              <li>
                <Link href="/features#animatics" className="hover:text-white">
                  Video Animatics NLE
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing & Studio Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Workspace
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/app/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/create" className="hover:text-white">
                  Create Storyboard
                </Link>
              </li>
              <li>
                <Link href="/app/inspiration" className="hover:text-white">
                  Community Inspiration
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white">
                  Help & Shortcuts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Security & Governance
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login-signup" className="hover:text-white">
                  Invite-Only Admission
                </Link>
              </li>
              <li>
                <Link href="/admin/invitations" className="hover:text-white">
                  Admin Invitations Console
                </Link>
              </li>
              <li>
                <Link href="/admin/audit-logs" className="hover:text-white">
                  Security Audit Logs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} StoryTribe Studio. All rights reserved.</p>
          <p>Next.js 16 · NextAuth v4 · Prisma 7 Dual-DB Engine</p>
        </div>
      </div>
    </footer>
  );
}
