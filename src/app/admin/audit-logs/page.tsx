"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, ShieldAlert, ShieldCheck, KeyRound } from "lucide-react";

interface AuditLogEntry {
  id: string;
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/audit-logs?action=${encodeURIComponent(actionFilter)}`
    );
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
    }
    setLoading(false);
  }, [actionFilter]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchLogs();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus, fetchLogs]);

  if (sessionStatus === "loading") {
    return <div className="p-12 text-center text-sm text-gray-500">Loading audit logs...</div>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">
            Administrator Access Required
          </h1>
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
      <div className="max-w-6xl mx-auto space-y-6">
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
                href="/admin/invitations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Manage Invitations
              </Link>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              Security & Invitation Audit Logs
            </h1>
            <p className="text-sm text-gray-600">
              Immutable audit trail of invitation issuance, redemption, revocation, rotation,
              and authentication events.
            </p>
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold"
          >
            <option value="ALL">All Actions</option>
            <option value="INVITATION_CREATED">INVITATION_CREATED</option>
            <option value="INVITATION_REDEEMED">INVITATION_REDEEMED</option>
            <option value="INVITATION_REVOKED">INVITATION_REVOKED</option>
            <option value="INVITATION_ROTATED">INVITATION_ROTATED</option>
            <option value="USER_REGISTERED">USER_REGISTERED</option>
            <option value="USER_LOGIN_SUCCESS">USER_LOGIN_SUCCESS</option>
            <option value="USER_LOGIN_FAILED">USER_LOGIN_FAILED</option>
            <option value="PROJECT_CREATED">PROJECT_CREATED</option>
            <option value="PROJECT_SHARED">PROJECT_SHARED</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading audit trail...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No audit log entries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Target</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono text-xs font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-800">
                        {log.actorEmail || "system"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                        {log.targetType ? `${log.targetType}:${log.targetId?.slice(0, 8)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600 max-w-md truncate">
                        {log.details || "{}"}
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
