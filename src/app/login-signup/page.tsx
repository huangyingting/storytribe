"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, User } from "lucide-react";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";

function LoginSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const initialCode = searchParams.get("code") || "";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (res?.error) {
      setError("Incorrect email or password");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/app/dashboard";
    router.push(callbackUrl);
    router.refresh();
  };

  const handleInviteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!inviteCode.trim()) {
      setError("An invitation code is required to register an account.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/invitations/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteCode.trim(),
          email: email.trim(),
          name: name.trim(),
          password,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Failed to redeem invitation.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created! Signing you in...");
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });
      setLoading(false);

      if (!loginRes?.error) {
        router.push("/app/dashboard");
        router.refresh();
      } else {
        setMode("login");
      }
    } catch {
      setError("Network error while redeeming invitation.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Auth Column */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          <StoryTribeLogo href="/" />
        </div>

        <div className="max-w-md w-full mx-auto my-8">
          <h1 className="text-3xl font-extrabold text-gray-950">
            {mode === "login" ? "Welcome back" : "Accept your invitation"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Log in to your StoryTribe workspace to continue storyboarding."
              : "StoryTribe registration is invite-only. Enter your single-use invitation code below."}
          </p>

          {error && (
            <div
              role="alert"
              data-testid="auth-error-banner"
              className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgotten-password"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Log in with Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleInviteSignup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Single-Use Invitation Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Paste your invitation code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Invited Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Create Password (min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Redeem Invitation & Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Have an invitation code?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("signup");
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign up with invitation
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400">
          Protected by StoryTribe Invite-Only Admission & Security Audit Logging.
        </div>
      </div>

      {/* Right Artwork Column */}
      <div className="hidden lg:flex flex-col justify-center p-16 bg-[#FBF9F5] border-l border-gray-200">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            StoryTribe Studio v3.4.6
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Bring scripts, storyboards, shot lists, and animatics together.
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Collaborate with directors, agencies, and production crews using customizable
            character rigs, freehand vector sketching, and instant multi-layout PDF/PPTX
            exports.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginSignupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading authentication...</div>}>
      <LoginSignupContent />
    </Suspense>
  );
}
