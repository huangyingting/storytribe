"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  PlusSquare,
  FolderKanban,
  Users,
  AtSign,
  SlidersHorizontal,
  Sparkles,
  Plus,
  UserCircle,
  Compass,
  Bookmark,
  UserPlus,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";

export default function AppWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isEditorRoute = pathname?.startsWith("/app/editor/");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/login-signup?callbackUrl=${encodeURIComponent(pathname || "/app/dashboard")}`
      );
    }
  }, [status, router, pathname]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/workspaces")
        .then((r) => (r.ok ? r.json() : { workspaces: [] }))
        .then((d) => setWorkspaces(d.workspaces || []))
        .catch(() => {});
    }
  }, [session?.user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">
        Loading StoryTribe workspace...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Full-bleed editor mode without workspace sidebar
  if (isEditorRoute) {
    return <>{children}</>;
  }

  const navLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
      pathname === href
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const initials = (session.user.name || session.user.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        <StoryTribeLogo href="/app/dashboard" size="sm" />
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar matching 10-app-dashboard.png */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#F9FAFB] border-r border-gray-200 flex flex-col justify-between p-3.5 transition-transform ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          <div className="px-2 pt-1 flex items-center justify-between">
            <StoryTribeLogo href="/app/dashboard" size="sm" />
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              ⚡ {session.user.aiCredits}
            </span>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <Link
              href="/app/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/dashboard")}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/app/create"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/create")}
            >
              <PlusSquare className="w-4 h-4" />
              Create
            </Link>
          </div>

          {/* Personal & Studio Workspace Section */}
          <div className="pt-2 border-t border-gray-200/80 space-y-1">
            <div className="px-2 py-1 flex items-center gap-2 text-xs font-bold text-gray-900">
              <span className="w-5 h-5 rounded bg-blue-600 text-white text-[11px] flex items-center justify-center">
                {initials}
              </span>
              <span>Personal</span>
            </div>

            <Link
              href="/app/projects"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/projects")}
            >
              <FolderKanban className="w-4 h-4" />
              Projects
            </Link>
            <Link
              href="/app/shared"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/shared")}
            >
              <Users className="w-4 h-4" />
              Shared with me
            </Link>
            <Link
              href="/app/elements"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/elements")}
            >
              <AtSign className="w-4 h-4" />
              Elements
            </Link>
            <Link
              href="/app/properties"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/properties")}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Properties
            </Link>
            <Link
              href="/app/ai-history"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/ai-history")}
            >
              <Sparkles className="w-4 h-4" />
              AI History
            </Link>

            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/app/workspace/${ws.id}`}
                onClick={() => setMobileNavOpen(false)}
                className={navLinkClass(`/app/workspace/${ws.id}`)}
              >
                <span
                  className="w-4 h-4 rounded text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: ws.avatarColor || "#2563EB" }}
                >
                  {ws.name[0]?.toUpperCase()}
                </span>
                <span className="truncate">{ws.name}</span>
              </Link>
            ))}

            <Link
              href="/app/workspace/setup"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/workspace/setup")}
            >
              <Plus className="w-4 h-4" />
              New workspace
            </Link>
          </div>

          {/* User Profile & Community Section */}
          <div className="pt-2 border-t border-gray-200/80 space-y-1">
            <div className="px-2 py-1 flex items-center gap-2 text-xs font-bold text-gray-900">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] flex items-center justify-center">
                {initials}
              </span>
              <span className="truncate">{session.user.name}</span>
            </div>

            <Link
              href="/app/profile"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/profile")}
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              href="/app/inspiration"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/inspiration")}
            >
              <Compass className="w-4 h-4" />
              Inspiration
            </Link>
            <Link
              href="/app/saved"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/saved")}
            >
              <Bookmark className="w-4 h-4" />
              Saved
            </Link>
            <Link
              href="/app/connections"
              onClick={() => setMobileNavOpen(false)}
              className={navLinkClass("/app/connections")}
            >
              <UserPlus className="w-4 h-4" />
              Connections
            </Link>
          </div>

          {/* Admin Governance Links */}
          {session.user.role === "ADMIN" && (
            <div className="pt-2 border-t border-gray-200/80 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Admin Governance
              </div>
              <Link
                href="/admin/invitations"
                className={navLinkClass("/admin/invitations")}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Invitations
              </Link>
              <Link
                href="/admin/audit-logs"
                className={navLinkClass("/admin/audit-logs")}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Audit Logs
              </Link>
            </div>
          )}
        </div>

        {/* Bottom System Links */}
        <div className="pt-3 border-t border-gray-200 space-y-1">
          <Link
            href="/app/notifications"
            onClick={() => setMobileNavOpen(false)}
            className={navLinkClass("/app/notifications")}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </Link>
          <Link
            href="/app/settings"
            onClick={() => setMobileNavOpen(false)}
            className={navLinkClass("/app/settings")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login-signup" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-y-auto">{children}</main>
    </div>
  );
}
