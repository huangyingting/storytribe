"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function GuestInviteTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    fetch(`/api/share?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setShareInfo(d?.shareLink || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500">
        Checking project guest invitation...
      </div>
    );
  }

  if (declined) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-gray-200 bg-white text-center space-y-4">
        <XCircle className="w-10 h-10 text-gray-400 mx-auto" />
        <h1 className="text-xl font-extrabold text-gray-950">
          Invitation Declined
        </h1>
        <p className="text-xs text-gray-500">
          You have declined this guest project invitation.
        </p>
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <Users className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Guest Collaboration Invite
        </span>
        <h1 className="text-2xl font-extrabold text-gray-950 pt-1">
          {shareInfo?.project?.title
            ? `Join "${shareInfo.project.title}"`
            : "Project Collaboration Invite"}
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          {shareInfo?.project
            ? `You have been invited to collaborate on "${shareInfo.project.title}" with ${
                shareInfo.permission || "VIEW"
              } access.`
            : `Invitation token: ${token}. Accept to open the shared storyboard or return to your workspace.`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setDeclined(true)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => {
            if (shareInfo?.project?.id) {
              router.push(`/app/editor/${shareInfo.project.id}`);
            } else {
              router.push(`/share/${token}`);
            }
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept & Open Storyboard
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
