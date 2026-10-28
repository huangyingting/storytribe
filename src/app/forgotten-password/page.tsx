"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";

export default function ForgottenPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FBF9F5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-6">
          <StoryTribeLogo href="/" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-950">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the email address associated with your StoryTribe account.
        </p>

        {submitted ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Reset request logged
            </div>
            <p className="text-xs leading-relaxed">
              If an account exists for <strong>{email}</strong>, password reset
              instructions have been recorded. Contact your workspace administrator if you
              need an immediate credential reset.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 transition"
            >
              {loading ? "Submitting..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href="/login-signup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
