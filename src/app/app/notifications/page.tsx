"use client";

import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    loadNotifications();
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Stay updated on project comments, shares, and workspace invites.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 rounded-2xl border border-gray-200 text-center text-sm text-gray-500">
          You are all caught up! No notifications yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-center justify-between ${
                n.isRead ? "opacity-70" : "bg-blue-50/30"
              }`}
            >
              <div>
                <div className="text-sm font-bold text-gray-900">{n.title}</div>
                <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
              </div>
              <span className="text-[11px] text-gray-400">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
