"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { StoryTribeLogo } from "@/components/common/StoryTribeLogo";

export default function InviteRedeemPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const rawToken = params?.token || "";

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<{
    email: string;
    role: string;
    expiresAt: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      setChecking(true);
      try {
        const res = await fetch(
          `/api/invitations/verify?token=${encodeURIComponent(rawToken)}`
        );
        const data = await res.json();
        if (data.valid && data.invitation) {
          setValid(true);
          setInviteInfo(data.invitation);
          setEmail(data.invitation.email);
        } else {
          setValid(false);
          setReason(data.reason || "Invalid or expired invitation link.");
        }
      } catch {
        setValid(false);
        setReason("Unable to verify invitation token.");
      } finally {
        setChecking(false);
      }
    }
    if (rawToken) verify();
  }, [rawToken]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/invitations/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: rawToken,
          email,
          name,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not redeem invitation.");
        setSubmitting(false);
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!login?.error) {
        router.push("/app/dashboard");
        router.refresh();
      } else {
        router.push("/login-signup");
      }
    } catch {
      setError("Network error while creating account.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <StoryTribeLogo href="/" />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Single-Use Invite
          </span>
        </div>

        {checking ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Verifying cryptographic invitation token...
          </div>
        ) : !valid ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Invitation Cannot Be Used</div>
                <p className="text-xs mt-1">{reason}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/login-signup")}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-950">
                Complete your StoryTribe account
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Invited as{" "}
                <span className="font-bold text-gray-800">
                  {inviteInfo?.role}
                </span>{" "}
                · Expires{" "}
                {inviteInfo?.expiresAt
                  ? new Date(inviteInfo.expiresAt).toLocaleDateString()
                  : "soon"}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Your Name
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Activating Account..." : "Accept Invitation & Join"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
