"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";
import { LifeBuoy, Mail, Copy, Check } from "lucide-react";

export default function SupportAccessPage() {
  const [copied, setCopied] = useState(false);
  const referenceId = "ST-DIAG-3460";
  const timestamp = new Date().toISOString();
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "StoryTribe Web Client";

  const diagnosticSummary = `Reference: ${referenceId}\nWhere: /support-access\nWhen: ${timestamp}\nBrowser: ${userAgent}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(diagnosticSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="mb-8">
        <StoryTribeLogo size="md" />
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-950">
              Support &amp; Diagnostic Access
            </h1>
            <p className="text-xs text-gray-500">
              Email us the diagnostic message below at{" "}
              <span className="font-semibold text-gray-800">
                support@storytribe.com
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs text-gray-700 space-y-1.5">
          <div>
            <span className="font-bold text-gray-900">Reference: </span>
            {referenceId}
          </div>
          <div>
            <span className="font-bold text-gray-900">Where: </span>
            /support-access
          </div>
          <div>
            <span className="font-bold text-gray-900">When: </span>
            {timestamp}
          </div>
          <div className="break-all">
            <span className="font-bold text-gray-900">Browser: </span>
            {userAgent}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:support@storytribe.com?subject=${encodeURIComponent(
              `StoryTribe Support (${referenceId})`
            )}&body=${encodeURIComponent(diagnosticSummary)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
          >
            <Mail className="w-4 h-4" />
            Email support@storytribe.com
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Diagnostics
              </>
            )}
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <Link href="/help" className="hover:text-gray-900">
            Visit Help Center
          </Link>
          <Link href="/app/dashboard" className="font-semibold text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
