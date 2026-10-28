"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Copy,
  Check,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Ban,
  ArrowLeft,
  FileText,
} from "lucide-react";

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  invitedBy?: { name?: string | null; email: string } | null;
  acceptedByUser?: { name?: string | null; email: string } | null;
}

export default function AdminInvitationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [issuedGrant, setIssuedGrant] = useState<{
    email: string;
    rawToken: string;
    inviteUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/invitations?status=${encodeURIComponent(statusFilter)}`
    );
    if (res.ok) {
      const data = await res.json();
      setInvitations(data.invitations || []);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchInvites();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus, fetchInvites]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIssuedGrant(null);

    const res = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role,
        expiresInHours,
        notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create invitation");
      return;
    }

    setIssuedGrant({
      email: data.invitation.email,
      rawToken: data.rawToken,
      inviteUrl: data.inviteUrl,
    });
    setEmail("");
    setNotes("");
    fetchInvites();
  };

  const handleRevoke = async (id: string) => {
    const res = await fetch(`/api/admin/invitations/${id}/revoke`, {
      method: "POST",
    });
    if (res.ok) {
      fetchInvites();
    }
  };

  const handleRotate = async (id: string) => {
    const res = await fetch(`/api/admin/invitations/${id}/rotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresInHours: 72 }),
    });
    const data = await res.json();
    if (res.ok) {
      setIssuedGrant({
        email: data.invitation.email,
        rawToken: data.rawToken,
        inviteUrl: data.inviteUrl,
      });
      fetchInvites();
    }
  };

  if (sessionStatus === "loading") {
    return <div className="p-12 text-center text-sm text-gray-500">Loading admin console...</div>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">
            Administrator Access Required
          </h1>
          <p className="text-xs text-gray-500">
            Only accounts with the <strong>ADMIN</strong> role can issue, revoke, or rotate
            StoryTribe invitation codes.
          </p>
          <Link
            href="/app/dashboard"
            className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/app/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workspace
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/admin/audit-logs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                View Security Audit Logs
              </Link>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              Invite-Only Account Admission Console
            </h1>
            <p className="text-sm text-gray-600">
              Issue single-use expiring invitation tokens, assign USER or ADMIN roles, and
              revoke or rotate credentials.
            </p>
          </div>
        </div>

        {/* Create Invitation Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Issue New Single-Use Invitation
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {error}
            </div>
          )}

          {issuedGrant && (
            <div
              data-testid="issued-invitation-banner"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2"
            >
              <div className="text-xs font-bold text-emerald-900">
                One-Time Invitation Created for {issuedGrant.email} (Copy now — raw token is hashed in DB):
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={issuedGrant.inviteUrl}
                  data-testid="issued-invite-url"
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-emerald-300 font-mono text-xs text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(issuedGrant.inviteUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Invite URL"}
                </button>
              </div>
              <div className="text-[11px] font-mono text-emerald-800">
                Code: <span data-testid="issued-raw-token">{issuedGrant.rawToken}</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
          >
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@studio.com"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Expires (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                Issue Invite
              </button>
            </div>
          </form>
        </div>

        {/* Invitations Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["ALL", "PENDING", "ACCEPTED", "REVOKED", "EXPIRED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    statusFilter === st
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {invitations.length} invitation(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading invitations...
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No invitations match the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/70">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {inv.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            inv.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {inv.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            inv.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : inv.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {new Date(inv.expiresAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {inv.notes || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {inv.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100"
                          >
                            <Ban className="w-3 h-3" />
                            Revoke
                          </button>
                        )}
                        {inv.status !== "ACCEPTED" && (
                          <button
                            type="button"
                            onClick={() => handleRotate(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Rotate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
