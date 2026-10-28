"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle2, ArrowRight, XCircle } from "lucide-react";

export default function AppWorkspaceInviteTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token || "";
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">("pending");

  return (
    <div className="p-6 sm:p-10 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
            Workspace Invitation
          </span>
          <h1 className="text-xl font-extrabold text-gray-950 mt-3">
            Join Studio Workspace
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Invite token:{" "}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-700">
              {token}
            </code>
          </p>
        </div>

        {status === "accepted" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Workspace invitation accepted!
            </div>
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
            >
              Open Workspace Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : status === "declined" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-100 text-xs text-gray-700 font-semibold flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 text-gray-500" />
              Invitation declined.
            </div>
            <Link
              href="/app/dashboard"
              className="inline-block text-xs font-bold text-blue-600 hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStatus("accepted")}
                className="px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
              >
                Accept Invite
              </button>
              <button
                type="button"
                onClick={() => setStatus("declined")}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Decline
              </button>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push(`/invite/${encodeURIComponent(token)}`)}
                className="text-[11px] text-gray-500 hover:text-gray-900 underline"
              >
                Redeem as new account registration invite instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
