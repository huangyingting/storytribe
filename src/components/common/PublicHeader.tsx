"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, User, Sparkles } from "lucide-react";
import { StoryTribeLogo } from "./StoryTribeLogo";

export function PublicHeader() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <StoryTribeLogo href="/" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-800">
            <Link href="/features" className="hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/help" className="hover:text-blue-600 transition-colors">
              Help
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/invitations"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Admin Invitations
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              <Sparkles className="w-4 h-4" />
              Go to Workspace
            </Link>
          ) : (
            <Link
              href="/login-signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
            >
              <User className="w-4 h-4" />
              Sign up / Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link
            href="/features"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-base font-semibold text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-base font-semibold text-gray-900"
          >
            Pricing
          </Link>
          <Link
            href="/help"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-base font-semibold text-gray-900"
          >
            Help
          </Link>
          <div className="pt-2 border-t border-gray-100">
            {session?.user ? (
              <Link
                href="/app/dashboard"
                className="block w-full text-center py-2.5 rounded-lg bg-gray-900 text-white font-semibold"
              >
                Open Workspace
              </Link>
            ) : (
              <Link
                href="/login-signup"
                className="block w-full text-center py-2.5 rounded-lg bg-gray-900 text-white font-semibold"
              >
                Sign up / Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
