"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Settings } from "lucide-react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "account";

  const [tab, setTab] = useState<
    "account" | "profile" | "notifications" | "billing" | "workspace"
  >(
    (["account", "profile", "notifications", "billing", "workspace"].includes(
      initialTab
    )
      ? initialTab
      : "account") as any
  );

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          setName(d.user.name || "");
          setUsername(d.user.username || "");
          setBio(d.user.bio || "");
          setProfession(d.user.profession || "");
          setCompany(d.user.company || "");
          setLocation(d.user.location || "");
          setWebsite(d.user.website || "");
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        username,
        bio,
        profession,
        company,
        location,
        website,
      }),
    });
    if (res.ok) {
      setSavedMessage("Settings saved successfully.");
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your account, creator profile, notifications, and plan preferences.
        </p>
      </div>

      {/* 5 Settings Tabs matching 20-app-settings-account.png */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { id: "account", label: "Account" },
          { id: "profile", label: "Profile" },
          { id: "notifications", label: "Notifications" },
          { id: "billing", label: "Billing & Credits" },
          { id: "workspace", label: "Workspace" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t.id
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {savedMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {savedMessage}
        </div>
      )}

      {(tab === "account" || tab === "profile") && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Username Handle
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Role / Profession
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Director / Storyboard Artist"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Studio / Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            Save Changes
          </button>
        </form>
      )}

      {tab === "notifications" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Email & In-App Notification Preferences
          </h2>
          {[
            "New comments pinned on my storyboards",
            "Project share invitations from collaborators",
            "Weekly StoryTribe feature updates",
          ].map((label) => (
            <label key={label} className="flex items-center gap-3 text-xs text-gray-700">
              <input type="checkbox" defaultChecked className="rounded" />
              {label}
            </label>
          ))}
        </div>
      )}

      {tab === "billing" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-blue-600">
                Current Plan
              </div>
              <div className="text-xl font-extrabold text-gray-950 mt-0.5">
                {user?.planTier || "FREE"} Plan
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
              ⚡ {user?.aiCredits ?? 50} Tribe AI Credits Remaining
            </div>
          </div>
        </div>
      )}

      {tab === "workspace" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">
            Workspace Defaults
          </h2>
          <p className="text-xs text-gray-500">
            Default frame aspect ratio: 16:9 Widescreen (1920×1080). All new projects
            automatically include the 4 standard production shot properties.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
