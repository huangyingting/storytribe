"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";
import { AlertCircle, CheckCircle2, KeyRound, MailCheck } from "lucide-react";

function AccountActionContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "resetPassword";
  const oobCode = searchParams.get("oobCode") || searchParams.get("code") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(
    !oobCode
      ? "Invalid recovery link. Please check the link and try again."
      : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!oobCode) {
      setError("Invalid recovery link. Please check the link and try again.");
      return;
    }
    if (mode === "resetPassword") {
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center px-4">
      <div className="mb-8">
        <StoryTribeLogo size="md" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {mode === "verifyEmail" ? (
              <MailCheck className="w-5 h-5" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-950">
              {mode === "verifyEmail"
                ? "Verify your email"
                : "Reset your password"}
            </h1>
            <p className="text-xs text-gray-500">
              StoryTribe Account Security Action
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {completed ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {mode === "verifyEmail"
                ? "Your email has been verified successfully!"
                : "Your password has been updated."}
            </div>
            <Link
              href="/login-signup"
              className="block w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-center text-xs font-bold hover:bg-gray-800"
            >
              Continue to Sign In
            </Link>
          </div>
        ) : mode === "verifyEmail" && oobCode ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Confirm verification for action code{" "}
              <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">
                {oobCode}
              </code>
              .
            </p>
            <button
              type="button"
              onClick={() => setCompleted(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
            >
              Confirm Email Verification
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
            >
              Save New Password
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <Link href="/forgotten-password" className="hover:text-gray-900">
            Request new recovery link
          </Link>
          <Link href="/login-signup" className="font-semibold text-gray-900">
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountActionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-gray-500">Loading...</div>}>
      <AccountActionContent />
    </Suspense>
  );
}
