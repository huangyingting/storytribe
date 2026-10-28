"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "sent" | "verified">(
    token ? "verified" : "idle"
  );

  const handleResend = () => {
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          {status === "verified" ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          ) : (
            <MailCheck className="w-7 h-7" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-950">
            {status === "verified"
              ? "Email Verified"
              : "Activate your account"}
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            {status === "verified"
              ? "Your StoryTribe account email has been confirmed. You can now access your workspace and storyboards."
              : `We sent a verification link to ${
                  email || "your email address"
                }. Click the link inside to verify your email address, or continue directly if registered with a single-use invitation code.`}
          </p>
        </div>

        {status === "sent" && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            Verification email resent! Please check your inbox and spam folder.
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <Link
            href="/app/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 transition"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          {status !== "verified" && (
            <button
              type="button"
              onClick={handleResend}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend verification email
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
          <Link href="/login-signup" className="hover:text-gray-700 underline">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-gray-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
